import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from './category.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UserEntity } from 'src/users/user.entity';
import { ThreadEntity } from 'src/threads/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, UserEntity, ThreadEntity])],
  providers: [CategoriesService],
  controllers: [CategoriesController]
})
export class CategoriesModule {}
