import { Controller, Get, Body, Post, UsePipes, ValidationPipe, UseGuards, Param, Put, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/users/user.decorator';
import { RoleDTO } from './role.dto';

@Controller('roles')
export class RolesController {

    constructor(private rolesService: RolesService) {}

    @Get()
    async getAllPosts() {
        return await this.rolesService.getAll();
    }

    @Post('new')
    @UsePipes(new ValidationPipe())
    @UseGuards(new AuthGuard())
    async createNewRole(@User('id') userId, @Body() data: RoleDTO) {
        return await this.rolesService.createNewRole(userId, data);
    }

    @Get(':id')
    async getRole(@Param('id') roleId) {
        return await this.rolesService.getRole(roleId);
    }

    @Put(':id')
    @UsePipes(new ValidationPipe())
    @UseGuards(new AuthGuard())
    async updateRole(@User('id') userId, @Param('id') roleId, @Body() data: Partial < RoleDTO > ) {
        return await this.rolesService.updateRole(userId, roleId, data);
    }

    @Delete(':id')
    @UseGuards(new AuthGuard())
    async deleteRole(@User('id') userId, @Param('id') roleId) {
        return await this.rolesService.deleteRole(userId, roleId);
    }

    @Post(':id/assign')
    @UseGuards(new AuthGuard())
    async assignUserToRole(@User('id') userId: string, @Body('target') to: string, @Param('id') roleId: string) {
        return await this.rolesService.assignUserToRole(userId, to, roleId);
    }

    @Post(':id/unassign')
    @UseGuards(new AuthGuard())
    async unassignUserFromRole(@User('id') userId: string, @Body('target') to: string, @Param('id') roleId: string) {
        return await this.rolesService.unassignUserFromRole(userId, to, roleId);
    }

}
