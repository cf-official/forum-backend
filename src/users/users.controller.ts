import { Controller, Post, Get, Body, UsePipes, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './user.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';

@Controller('api/v1/users')
export class UsersController {
  constructor(private userService: UsersService) {}

  // !DEBUG ONLY!
  @Get()
  async allUsers() {
    return this.userService.allUsers();
  }

  @Get(':id')
  async getUser() {
    return null;
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() data: UserDTO) {
    return this.userService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  async register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }
}
