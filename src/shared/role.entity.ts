import { Entity, Column, PrimaryColumn, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('role')
export class RoleEntity {

    @PrimaryColumn('bigint')
    id: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column('text')
    name: string;

    @ManyToMany(type => UserEntity, user => user.roles)
    users: UserEntity[];

}
