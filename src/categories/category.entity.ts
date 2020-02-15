import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';

import {
    UserEntity
} from 'src/users/user.entity';
import { ThreadEntity } from 'src/threads/thread.entity';

@Entity('category')
export class CategoryEntity {
    @PrimaryColumn('bigint')
    id: string;

    @Column('text')
    name: string;

    @Column('text')
    description: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @ManyToOne(
        () => UserEntity,
        user => user.categories
    )
    creator: UserEntity;

    // todo: adv. permissions

    @OneToMany(
        type => ThreadEntity,
        thread => thread.category,
        { cascade: true }
    )
    threads: ThreadEntity[];

    @Column('json')
    advancedPerms: object;
}
