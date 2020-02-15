import {
    Controller,
    Body,
    Post,
    Put,
    Delete,
    Get,
    UsePipes,
    UseGuards,
    Param
} from '@nestjs/common';
import {
    ThreadsService
} from './threads.service';
import {
    ThreadDTO
} from './thread.dto';
import {
    ValidationPipe
} from 'src/shared/validation.pipe';
import {
    AuthGuard
} from 'src/shared/auth.guard';
import {
    User
} from 'src/users/user.decorator';

@Controller('threads')
export class ThreadsController {
    constructor(private threadsService: ThreadsService) {}

    @Get()
    async getAllThreads(@Body('page') page: number, @Body('newest') newest?: boolean) {
        return await this.threadsService.getAll(page, newest);
    }

    @Post('new')
    @UsePipes(new ValidationPipe())
    @UseGuards(new AuthGuard())
    async createNewThread(@User('id') userId, @Body() data: ThreadDTO) {
        return await this.threadsService.createNewThread(userId, data);
    }

    @Get(':id')
    async getThread(@Param('id') threadId) {
        return await this.threadsService.getThread(threadId);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe())
    @UseGuards(new AuthGuard())
    async updateThread(@User('id') userId, @Param('id') threadId, @Body() data: Partial < ThreadDTO > ) {
        return await this.threadsService.updateThread(userId, threadId, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    async deleteThread(@User('id') userId, @Param('id') threadId) {
        return await this.threadsService.deleteThread(userId, threadId);
    }
}
