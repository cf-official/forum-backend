import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from 'src/users/user.entity';
import { ThreadEntity } from 'src/threads/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, UserEntity, ThreadEntity])],
  providers: [PostsService],
  controllers: [PostsController]
})
export class PostsModule {}
