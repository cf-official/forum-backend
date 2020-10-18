import {
    Entity,
    PrimaryColumn,
    Column,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CategoryEntity } from 'src/categories/category.entity';
import { Permissions } from 'src/shared/Permissions';
import { ThreadEntity } from 'src/threads/thread.entity';
import { PostEntity } from 'src/posts/post.entity';
import { RoleEntity } from 'src/roles/role.entity';
import { BitPerm } from 'src/shared/BitPerm';

@Entity('user')
export class UserEntity {
    @PrimaryColumn('bigint')
    id: string;

    @Column({
        type: 'text',
        unique: true,
    })
    username: string;

    @Column('boolean')
    emailHidden: boolean;

    @Column({
        type: 'text',
        unique: true,
    })
    email: string;

    @Column('text', { nullable: true })
    password: string;

    @Column('text')
    accountType: 'github' | 'discord' | 'regular';

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    @ManyToMany(
        (type) => RoleEntity,
        (role) => role.users,
        { cascade: true }
    )
    @JoinTable()
    roles: RoleEntity[];

    @OneToMany(
        () => CategoryEntity,
        (category) => category.creator,
        { cascade: true }
    )
    categories: CategoryEntity[];

    @OneToMany(
        () => ThreadEntity,
        (thread) => thread.author,
        { cascade: true }
    )
    threads: CategoryEntity[];

    @OneToMany(
        () => PostEntity,
        (post) => post.author,
        { cascade: true }
    )
    posts: PostEntity[];

    @BeforeInsert()
    async hashPassword() {
        if (this.accountType === 'regular') {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

    public get permissions(): number {
        const permissions = new BitPerm(0x0);

        if (!this.roles) {
            return Permissions.CREATE_POSTS;
        }

        this.roles
            .sort((n1, n2) => n1.position - n2.position)
            .reverse()
            .forEach((role) => {
                permissions.set(role.allowed);
                permissions.unset(role.denied);
            });

        if (permissions.has(Permissions.MANAGE_ROLES) || permissions.has(Permissions.ASSIGN_ROLES) || permissions.has(Permissions.ADMINISTRATOR)) {
            permissions.set(Permissions.ACCESS_CONTROL_PANEL);
        }

        return permissions.permissions;
    }

    toResponseObject(showToken: boolean = true) {
        const { id, username, email, created, updated, permissions } = this;

        const resObj: any = {
            id,
            username,
            created,
            updated,
            permissions,
        };

        if (this.roles) {
            resObj.roles = this.roles.map((r: RoleEntity) => r.id);
        }

        if (this.categories) {
            resObj.categories = this.categories.map((category) => category.id);
        }

        if (this.threads) {
            resObj.threads = this.threads.map((thread) => thread.id);
        }

        if (this.posts) {
            resObj.posts = this.posts.map((post) => post.id);
        }

        if (showToken) {
            resObj.token = this.token;
        }

        if (!this.emailHidden) {
            resObj.email = email;
        }

        return resObj;
    }

    async validatePassword(pass: string) {
        return await bcrypt.compare(pass, this.password);
    }

    public get token() {
        const { id, username } = this;
        return jwt.sign(
            {
                id,
                username,
            },
            process.env.SECRET,
            {
                expiresIn: '2m',
            }
        );
    }

    hasPermission(permission): boolean {
        if (!!(this.permissions & Permissions.ADMINISTRATOR)) {
            return true;
        }
        return !!(this.permissions & permission);
    }
}
