import {
    Injectable,
    HttpService,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import {
    InjectRepository
} from '@nestjs/typeorm';
import {
    UserEntity
} from 'src/users/user.entity';
import {
    Repository
} from 'typeorm';
import * as qs from 'querystring';
import { UniqueID } from 'nodejs-snowflake';

const DISCORD_API_ENDPOINT = 'https://discordapp.com/api/v6';
const GITHUB_API_ENDPOINT = 'https://github.com';

const DISCORD = {
    client_id: '607163424362856458',
    client_secret: 'tPCoMjj36fa-SNMTXzelJlkqz9JGsyNr',
    grant_type: 'authorization_code',
    redirect_uri: 'https://aurora.codeforge.cf/callback',
    scope: 'identify email'
};

const GITHUB = {
    client_id: '9135f537e6803cfe5c76',
    client_secret: '9b5f1ee14c3c4116d1ec4c0bb34d992fe0284b14',
    redirect_uri: 'https://aurora.codeforge.cf/callback'
};

const uid = new UniqueID({ customEpoch: 1577836800, returnNumber: false });

@Injectable()
export class OauthService {

    constructor(
        private http: HttpService,
        @InjectRepository(UserEntity) private userRepository: Repository < UserEntity >
    ) {}

    async loginWithGithub(code) {

        const response = await this.http.post(GITHUB_API_ENDPOINT + '/login/oauth/access_token', {
            ...GITHUB,
            code
        }, {
            headers: {
                Accept: 'application/json'
            }
        }).toPromise();

        const user: any = await this.http.get('https://api.github.com/user', {
            headers: {
                Authorization: `token ${response.data.access_token}`
            }
        }).toPromise();

        let email = user.data.email;

        if (!email) {
            const emails = await this.http.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `token ${response.data.access_token}`,
                    Accept: 'application/json'
                }
            }).toPromise();
            email = emails.data.filter(e => e.primary)[0].email;
        }

        let cfUser = await this.userRepository.findOne({ where: { username: user.data.login } });

        if (cfUser && cfUser.accountType !== 'github') {
            throw new HttpException('User with this username already exists!', HttpStatus.BAD_REQUEST);
        }

        if (!cfUser) {
            cfUser = await this.userRepository.findOne({ where: { email } });
            if (cfUser) {
                throw new HttpException('User with this email already exists!', HttpStatus.BAD_REQUEST);
            }
            cfUser = this.userRepository.create({
                username: user.data.login,
                id: uid.getUniqueID() as string,
                email,
                emailHidden: true,
                accountType: 'github'
            });
            await this.userRepository.save(cfUser);
        }

        return {
            access_token: cfUser.token,
            expires_in: 10080,
            scope: 'read:user user:email',
            token_type: 'Bearer'
        };
    }

    async loginWithDiscord(code) {
        const response = await this.http.post(DISCORD_API_ENDPOINT + '/oauth2/token', qs.stringify({
            ...DISCORD,
            code
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).toPromise();

        const user: any = await this.http.get(DISCORD_API_ENDPOINT + '/users/@me', {
            headers: {
                Authorization: `Bearer ${response.data.access_token}`
            }
        }).toPromise();

        let cfUser = await this.userRepository.findOne({ where: { username: user.data.username } });

        if (cfUser && cfUser.accountType !== 'discord') {
            throw new HttpException('User with this username already exists!', HttpStatus.BAD_REQUEST);
        }

        if (!cfUser) {
            cfUser = await this.userRepository.findOne({ where: { email: user.data.email } });
            if (cfUser) {
                throw new HttpException('User with this email already exists!', HttpStatus.BAD_REQUEST);
            }
            cfUser = this.userRepository.create({
                username: user.data.username,
                id: uid.getUniqueID() as string,
                email: user.data.email,
                emailHidden: true,
                accountType: 'discord'
            });
            await this.userRepository.save(cfUser);
        }

        return {
            access_token: cfUser.token,
            expires_in: 10080,
            scope: 'identify email',
            token_type: 'Bearer'
        };

    }

}
