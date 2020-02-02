import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn
} from 'typeorm';

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

    @Column('bigint')
    creator: string;

    @Column('json')
    advancedPerms: object;
}
