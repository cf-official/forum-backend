import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './role.entity';
import { Repository } from 'typeorm';
import { RoleDTO } from './role.dto';
import { UserEntity } from 'src/users/user.entity';
import { Permissions } from 'src/shared/Permissions';
import { UniqueID } from 'nodejs-snowflake';

const uid = new UniqueID({
    customEpoch: 1577836800,
    returnNumber: false
});

@Injectable()
export class RolesService {

    constructor(
        @InjectRepository(RoleEntity) private roleRepository: Repository<RoleEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
    ) {}

    async getAll() {
        const roles = await this.roleRepository.find({
            relations: ['users']
        });
        return roles.map(this.roleToResponseObject);
    }

    private roleToResponseObject(role: RoleEntity) {
        const responseObject: any = {
            ...role
        };

        if (role.users) {
            responseObject.users = role.users.map(u => u.id);
        }

        return responseObject;
    }

    async createNewRole(userId: string, data: RoleDTO) {

        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.MANAGE_ROLES)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        const role = this.roleRepository.create(data);
        role.id = uid.getUniqueID() as string;
        this.roleRepository.save(role);

        return this.roleToResponseObject(role);
    }

    async getRole(id: string) {
        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
            throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
        }
        return this.roleToResponseObject(role);
    }

    async updateRole(userId: string, roleId: string, data: Partial < RoleDTO > ) {

        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        let role = await this.roleRepository.findOne({ where: { id: roleId } });

        if (!role) {
            throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.MANAGE_ROLES)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        await this.roleRepository.update(roleId, data);
        role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['users'] });

        return this.roleToResponseObject(role);
    }

    async deleteRole(userId: string, roleId: string) {

        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['roles'] });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['users'] });

        if (!role) {
            throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.MANAGE_ROLES)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        await this.roleRepository.delete(roleId);
        return this.roleToResponseObject(role);

    }

    async assignUserToRole(by: string, to: string, roleId: string) {

        const user = await this.userRepository.findOne({ where: { id: by }, relations: ['roles'] });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const target = await this.userRepository.findOne({ where: { id: to }, relations: ['roles'] });

        if (!target) {
            throw new HttpException('Invalid target user', HttpStatus.BAD_REQUEST);
        }

        let role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['users'] });

        if (!role) {
            throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.MANAGE_ROLES) && !user.hasPermission(Permissions.ASSIGN_ROLES)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        if (!role.users.includes(target)) {
            role.users.push(target);
            await this.roleRepository.save(role);
            role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['users'] });
        }

        return this.roleToResponseObject(role);

    }

    async unassignUserFromRole(by: string, to: string, roleId: string) {

        const user = await this.userRepository.findOne({ where: { id: by }, relations: ['roles'] });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const target = await this.userRepository.findOne({ where: { id: to }, relations: ['roles'] });

        if (!target) {
            throw new HttpException('Invalid target user', HttpStatus.BAD_REQUEST);
        }

        let role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['users'] });

        if (!role) {
            throw new HttpException('Invalid role', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.MANAGE_ROLES) && !user.hasPermission(Permissions.ASSIGN_ROLES)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        if (role.users.includes(target)) {
            role.users = role.users.filter(u => u.id !== target.id);
            await this.roleRepository.save(role);
            role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['users'] });
        }

        return this.roleToResponseObject(role);

    }

}
