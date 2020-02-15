import { PrimaryColumn, Column, ManyToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Entity } from 'typeorm';
import { UserEntity } from 'src/users/user.entity';
import { BitPerm } from 'src/shared/BitPerm';

@Entity('role')
export class RoleEntity {

    @PrimaryColumn('bigint')
    id: string;

    @Column('text', { unique: true })
    name: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column('integer', { unique: true })
    position: number;

    @Column('integer')
    allowed: number;

    @Column('integer')
    denied: number;

    @ManyToMany(type => UserEntity, { cascade: true })
    @JoinColumn()
    users: UserEntity[];

}
