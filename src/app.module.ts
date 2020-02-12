import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpErrorFilter } from './shared/error.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './users/users.module';

@Module({
  imports: [TypeOrmModule.forRoot(), CategoriesModule, ThreadsModule, PostsModule, CommentsModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter
    }
  ],
})
export class AppModule {}
