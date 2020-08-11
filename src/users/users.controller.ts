import { Controller, Post, Get, Body, UsePipes, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './user.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from './user.decorator';
import { AuthDTO } from 'src/shared/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // !DEBUG ONLY!
  @Get()
  async allUsers() {
    return await this.userService.allUsers();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.getUser(id);
  }

  @Get('auth/@me')
  @UseGuards(new AuthGuard())
  async getLoggedInUser(@User('id') userId: string) {
    return await this.userService.getCurrentUser(userId);
  }

  @Post('auth/login')
  @UsePipes(new ValidationPipe())
  async login(@Body() data: AuthDTO) {
    return await this.userService.login(data);
  }

  @Post('auth/register')
  @UsePipes(new ValidationPipe())
  async register(@Body() data: UserDTO) {
    return await this.userService.register(data);
  }
}
