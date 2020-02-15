import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThreadEntity } from './thread.entity';
import { UserEntity } from 'src/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ThreadEntity, UserEntity])],
  providers: [ThreadsService],
  controllers: [ThreadsController]
})
export class ThreadsModule {}
