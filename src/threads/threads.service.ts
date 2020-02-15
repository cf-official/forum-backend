import {
    Injectable,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import {
    ThreadEntity
} from './thread.entity';
import {
    InjectRepository
} from '@nestjs/typeorm';
import {
    Repository
} from 'typeorm';
import {
    UserEntity
} from 'src/users/user.entity';
import {
    ThreadDTO
} from './thread.dto';
import {
    Permissions
} from 'src/shared/Permissions';
import UniqueID from 'nodejs-snowflake';

const uid = new UniqueID({
    customEpoch: 1577836800,
    returnNumber: false
});

@Injectable()
export class ThreadsService {

    constructor(
        @InjectRepository(ThreadEntity) private threadRepository: Repository < ThreadEntity > ,
        @InjectRepository(UserEntity) private userRepository: Repository < UserEntity >
    ) {}

    async getAll(page: number = 1, newest?: boolean) {
        const threads = await this.threadRepository.find({
            relations: ['author', 'posts', 'category'],
            take: 25,
            skip: 25 * (page - 1),
            order: newest && {
                created: 'DESC'
            },
        });
        return threads.map(this.threadToResponseObject);
    }

    private threadToResponseObject(thread: ThreadEntity) {
        const responseObject: any = {
            ...thread,
            author: thread.author.toResponseObject(false)
        };
        return responseObject;
    }

    async createNewThread(userId: string, data: ThreadDTO) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['author', 'posts', 'category']
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.CREATE_THREADS)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        const thread = await this.threadRepository.create(data);
        thread.id = uid.getUniqueID() as string;
        thread.author = user;
        await this.threadRepository.save(thread);

        return this.threadToResponseObject(thread);

    }

    async getThread(id: string) {

        const thread = await this.threadRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'category', 'posts']
        });

        if (!thread) {
            throw new HttpException('Invalid thread', HttpStatus.BAD_REQUEST);
        }

        return this.threadToResponseObject(thread);

    }

    async updateThread(userId: string, id: string, data: Partial < ThreadDTO > ) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        let thread = await this.threadRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'posts', 'category']
        });

        if (!thread) {
            throw new HttpException('Invalid thread', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.EDIT_THREADS) && thread.author.id !== userId) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        await this.threadRepository.update(id, data);
        thread = await this.threadRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'posts', 'category']
        });
        return this.threadToResponseObject(thread);

    }

    async deleteThread(userId: string, id: string) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const thread = await this.threadRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'posts', 'category']
        });

        if (!thread) {
            throw new HttpException('Invalid thread', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.DELETE_THREADS) && thread.author.id !== user.id) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        await this.threadRepository.delete(id);
        return this.threadToResponseObject(thread);

    }

}
