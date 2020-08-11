import { Controller, Body, Post, Request } from '@nestjs/common';
import { OauthService } from './oauth.service';

@Controller('oauth')
export class OauthController {

    constructor(private oauthService: OauthService) {}

    @Post('discord')
    async loginWithDiscord(@Body('code') code) {
        return await this.oauthService.loginWithDiscord(code);
    }

    @Post('github')
    async loginWithGithub(@Body('code') code, @Request() req) {
        return await this.oauthService.loginWithGithub(code);
    }

}
