import { Entity, PrimaryColumn, Column, JoinTable, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToMany, OneToMany } from 'typeorm';
import { RoleEntity } from 'src/shared/role.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CategoryEntity } from 'src/categories/category.entity';
import { Permissions } from 'src/shared/permissions';

@Entity('user')
export class UserEntity {

    @PrimaryColumn('bigint')
    id: string;

    @Column({
        type: 'text',
        unique: true
    })
    username: string;

    @Column('text')
    password: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @Column('int')
    permissions: number;

    @ManyToMany(type => RoleEntity, role => role.users)
    @JoinTable()
    roles: RoleEntity[];

    @OneToMany(() => CategoryEntity, category => category.creator)
    categories: CategoryEntity[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    toResponseObject(showToken: boolean = true) {
        const { id, username, created, updated, permissions } = this;

        const resObj: any = {
          id,
          username,
          created,
          updated,
          permissions
        };

        if (this.roles) {
            resObj.roles = this.roles.map((r: RoleEntity) => r.id);
        }

        if (showToken) {
           resObj.token = this.token;
        }

        return resObj;
    }

    async validatePassword(pass: string) {
        return await bcrypt.compare(pass, this.password);
    }

    private get token() {
        const { id, username } = this;
        return jwt.sign({
            id,
            username
          },
          process.env.SECRET,
          { expiresIn: '7d' }
        );
    }

    hasPermission(permission): boolean {
        if (this.permissions & Permissions.ADMINISTRATOR) { return true; }
        return !!(this.permissions & permission);
    }

}
