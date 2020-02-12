import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import {
    UserEntity
} from 'src/users/user.entity';

@Entity('category')
export class CategoryEntity {
    @PrimaryColumn('bigint')
    id: string;

    @Column('text')
    name: string;

    @Column('text')
    description: string;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(
        () => UserEntity,
        user => user.categories
    )
    creator: UserEntity;

    @Column('json')
    advancedPerms: object;
}
