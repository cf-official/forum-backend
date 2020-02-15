import {
    Entity,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryColumn,
    ManyToMany,
    JoinTable
} from 'typeorm';
import {
    UserEntity
} from 'src/users/user.entity';
import { ThreadEntity } from 'src/threads/thread.entity';

@Entity('post')
export class PostEntity {

    @PrimaryColumn('bigint')
    id: string;

    @Column('text')
    title: string;

    @Column('text')
    content: string;

    @Column('boolean')
    pinned: boolean;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @ManyToOne(
        type => UserEntity,
        user => user.posts
    )
    author: UserEntity;

    @ManyToOne(
        type => ThreadEntity,
        thread => thread.posts
    )
    thread: ThreadEntity;

    @Column('int')
    views: number;

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    upvotes: UserEntity[];

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinTable()
    downvotes: UserEntity[];

    @Column('boolean')
    isPoll: boolean;

}
