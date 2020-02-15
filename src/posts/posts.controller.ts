import { Controller, Post, UsePipes, UseGuards, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDTO } from './post.dto';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/users/user.decorator';
import { ValidationPipe } from 'src/shared/validation.pipe';

@Controller('posts')
export class PostsController {

    constructor(private postsService: PostsService) {}

    @Get()
    async getAllPosts(@Body('page') page: number, @Body('newest') newest?: boolean) {
        return await this.postsService.getAll(page, newest);
    }

    @Post('new')
    @UsePipes(new ValidationPipe())
    @UseGuards(new AuthGuard())
    async createNewPost(@User('id') userId, @Body() data: PostDTO) {
        return await this.postsService.createNewPost(userId, data);
    }

    @Get(':id')
    async getPost(@Param('id') postId) {
        return await this.postsService.getPost(postId);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe())
    @UseGuards(new AuthGuard())
    async updatePost(@User('id') userId, @Param('id') postId, @Body() data: Partial < PostDTO > ) {
        return await this.postsService.updatePost(userId, postId, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    async deletePost(@User('id') userId, @Param('id') postId) {
        return await this.postsService.deletePost(userId, postId);
    }

    @Post(':id/upvote')
    @UseGuards(new AuthGuard())
    async upvotePost(@User('id') userId, @Param('id') postId) {
        return await this.postsService.upvote(userId, postId);
    }

    @Post(':id/downvote')
    @UseGuards(new AuthGuard())
    async downvotePost(@User('id') userId, @Param('id') postId) {
        return await this.postsService.downvote(userId, postId);
    }

}
