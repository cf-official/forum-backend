import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HttpErrorFilter } from './shared/error.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { APP_FILTER } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [TypeOrmModule.forRoot(), CategoriesModule, ThreadsModule, PostsModule, UsersModule, RolesModule, OauthModule],
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
