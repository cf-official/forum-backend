import {
    Injectable,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import {
    InjectRepository
} from '@nestjs/typeorm';
import {
    Repository
} from 'typeorm';
import {
    UniqueID
} from 'nodejs-snowflake';

import {
    CategoryEntity
} from './category.entity';
import {
    CategoryDTO
} from './category.dto';
import {
    UserEntity
} from 'src/users/user.entity';
import {
    Permissions
} from 'src/shared/permissions';

const uid = new UniqueID({
    customEpoch: 1577836800,
    returnNumber: false
});

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(CategoryEntity) private categoryRepository: Repository < CategoryEntity > ,
        @InjectRepository(UserEntity) private userRepository: Repository < UserEntity >
    ) {}

    async getAllCategories() {
        return await this.categoryRepository.find();
    }

    async getCategory(id: string) {
        const category = await this.categoryRepository.findOne(id);
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
        return category;
    }

    async create(data: CategoryDTO, userId: string) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        if (
            !(user.hasPermission(Permissions.CREATE_CATEGORIES))
        ) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        const category = await this.categoryRepository.create({ ...data, creator: user });

        category.id = uid.getUniqueID() as string;

        await this.categoryRepository.save(category);
        return {
          ...category,
          creator: user.toResponseObject(false)
        };
    }

    async delete(id: string, userId: string) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        if (
            !(user.hasPermission(Permissions.DELETE_CATEGORIES))
        ) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        const category = await this.categoryRepository.findOne({
            where: {
                id
            }
        });
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
        await this.categoryRepository.delete(id);
        return category;
    }

    async update(id: string, data: Partial < CategoryDTO > , userId: string) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        let category = await this.categoryRepository.findOne({
          where: {
            id
          }
        });
        if (!category) {
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        if (
            !(user.hasPermission(Permissions.EDIT_CATEGORIES)) &&
            !(category.creator === user)
        ) {
            throw new HttpException(
                'Insufficient permissions',
                HttpStatus.FORBIDDEN
            );
        }

        await this.categoryRepository.update(id, data);
        category = await this.categoryRepository.findOne({
            where: {
                id
            }
        });
        return category;
    }
}
