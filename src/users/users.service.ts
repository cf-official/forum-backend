import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniqueID } from 'nodejs-snowflake';

import { UserEntity } from './user.entity';
import { RoleEntity } from 'src/shared/role.entity';
import { UserDTO } from './user.dto';
import { Permissions } from 'src/shared/permissions';

const uid = new UniqueID({ customEpoch: 1577836800, returnNumber: false });

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async allUsers() {
    return (await this.userRepository.find({ relations: ['roles'] })).map(
      user => user.toResponseObject(false)
    );
  }

  async login(data: UserDTO) {
    const { username, password } = data;

    const user = await this.userRepository.findOne({ where: { username }, relations: ['roles']});
    if (!user || !(await user.validatePassword(password))) {
        throw new HttpException('Invalid username/password', HttpStatus.FORBIDDEN);
    }

    return user.toResponseObject();
  }

  async register(data: UserDTO) {

    const { username, password } = data;

    let user = await this.userRepository.findOne({ where: { username } });

    if (user) {
        throw new HttpException(
          'User already exists',
          HttpStatus.BAD_REQUEST
        );
    }

    user = this.userRepository.create(data);
    user.id = uid.getUniqueID() as string;
    user.password = password;
    user.roles = [];
    user.categories = [];
    user.permissions = Permissions.ADMINISTRATOR;
    await this.userRepository.save(user);

    return user.toResponseObject();

  }
}
