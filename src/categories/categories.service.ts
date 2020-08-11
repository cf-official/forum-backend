import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UniqueID } from 'nodejs-snowflake';

import { CategoryEntity } from './category.entity';
import { CategoryDTO } from './category.dto';
import { UserEntity } from 'src/users/user.entity';
import { Permissions } from 'src/shared/Permissions';
import { ThreadEntity } from 'src/threads/thread.entity';

const uid = new UniqueID({
  customEpoch: 1577836800,
  returnNumber: false,
});

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ThreadEntity)
    private readonly threadRepository: Repository<ThreadEntity>
  ) {}

  async getAll(page: number = 1, newest?: boolean) {
    const categories = await this.categoryRepository.find({
      relations: ['creator', 'threads'],
      take: 5,
      skip: 5 * (page - 1),
      order: newest && {
        created: 'DESC',
      },
    });

    return categories.map(this.categoryToResponseObject);

  }

  private categoryToResponseObject(category: CategoryEntity) {
    const responseObject: any = {
      ...category,
      creator: category.creator.toResponseObject(false),
    };

    return responseObject;
  }

  async getCategory(id: string) {
    const category = await this.categoryRepository.findOne(id, {
      relations: ['threads', 'creator'],
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    return this.categoryToResponseObject(category);
  }

  async getThreads(id: string) {
    const category = await this.categoryRepository.findOne(id, {
      relations: ['threads'],
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    if (!category.threads) {
      throw new HttpException(
        'No threads found in this category',
        HttpStatus.NOT_FOUND
      );
    }

    const threads = await this.threadRepository.find({
        where: {
            category: id
        },
        relations: ['author', 'posts']
    });

    return threads.map(t => {
        return {
            ...t,
            author: t.author.toResponseObject(false)
        };
    });
  }

  async create(data: CategoryDTO, userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['categories', 'roles', 'threads', 'posts'],
    });

    if (!user) {
      throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
    }

    if (!user.hasPermission(Permissions.CREATE_CATEGORIES)) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }

    const category = await this.categoryRepository.create({
      ...data,
      creator: user,
    });

    category.id = uid.getUniqueID() as string;

    await this.categoryRepository.save(category);
    return this.categoryToResponseObject(category);
  }

  async delete(id: string, userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['categories', 'roles', 'threads', 'posts'],
    });

    if (!user) {
      throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
    }

    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    if (
      !user.hasPermission(Permissions.DELETE_CATEGORIES) &&
      category.creator.id !== user.id
    ) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }

    await this.categoryRepository.delete(id);
    return this.categoryToResponseObject(category);
  }

  async update(id: string, data: Partial<CategoryDTO>, userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['categories', 'roles', 'threads', 'posts'],
    });

    if (!user) {
      throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
    }

    let category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    if (
      !user.hasPermission(Permissions.EDIT_CATEGORIES) &&
      category.creator.id !== user.id
    ) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }

    await this.categoryRepository.update(id, data);
    category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      relations: ['categories', 'roles', 'threads', 'posts'],
    });
    return this.categoryToResponseObject(category);
  }
}
