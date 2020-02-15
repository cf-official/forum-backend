import {
    Entity,
    Column,
    OneToMany,
    PrimaryColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import {
    UserEntity
} from 'src/users/user.entity';
import { PostEntity } from 'src/posts/post.entity';
import { CategoryEntity } from 'src/categories/category.entity';

@Entity('thread')
export class ThreadEntity {
    @PrimaryColumn('bigint')
    id: string;

    @Column('text')
    title: string;

    @Column('text')
    description: string;

    @OneToMany(
        type => PostEntity,
        post => post.thread,
        { cascade: true }
    )
    posts: PostEntity[];

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @ManyToOne(
        type => UserEntity,
        user => user.threads
    )
    author: UserEntity;

    @ManyToOne(
        type => CategoryEntity,
        category => category.threads
    )
    category: CategoryEntity;

}
