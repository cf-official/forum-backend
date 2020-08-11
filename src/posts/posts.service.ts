import {
    Injectable,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import {
    InjectRepository
} from '@nestjs/typeorm';
import {
    PostEntity
} from './post.entity';
import {
    Repository
} from 'typeorm';
import {
    PostDTO
} from './post.dto';
import {
    UniqueID
} from 'nodejs-snowflake';
import {
    UserEntity
} from 'src/users/user.entity';
import {
    Permissions
} from 'src/shared/Permissions';
import {
    ThreadEntity
} from 'src/threads/thread.entity';
import {
    Votes
} from 'src/shared/votes';

const uid = new UniqueID({
    customEpoch: 1577836800,
    returnNumber: false
});

@Injectable()
export class PostsService {

    constructor(
        @InjectRepository(PostEntity) private postRepository: Repository < PostEntity > ,
        @InjectRepository(UserEntity) private userRepository: Repository < UserEntity > ,
        @InjectRepository(ThreadEntity) private threadRepository: Repository < ThreadEntity >
    ) {}

    async getAll(page: number = 1, newest?: boolean) {
        const posts = await this.postRepository.find({
            relations: ['author', 'thread', 'upvotes', 'downvotes'],
            take: 25,
            skip: 25 * (page - 1),
            order: newest && {
                created: 'DESC'
            },
        });
        return posts.map(this.postToResponseObject);
    }

    private postToResponseObject(post: PostEntity) {
        const responseObject: any = {
            ...post,
            author: post.author.toResponseObject(false)
        };
        if (post.upvotes) {
            responseObject.upvotes = post.upvotes.length;
        }
        if (post.downvotes) {
            responseObject.downvotes = post.downvotes.length;
        }
        return responseObject;
    }

    async getPost(id: string) {

        const post = await this.postRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'thread', 'downvotes', 'upvotes']
        });

        if (!post) {
            throw new HttpException('Invalid post', HttpStatus.BAD_REQUEST);
        }

        await this.postRepository.update(id, {
            views: ++post.views
        });

        return this.postToResponseObject(post);

    }

    async createNewPost(userId: string, data: PostDTO) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['categories', 'roles', 'threads', 'posts']
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const thread = await this.threadRepository.findOne({
            where: {
                id: data.thread
            }
        });

        if (!thread) {
            throw new HttpException('Invalid thread', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.CREATE_POSTS)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        if (data.pinned && !user.hasPermission(Permissions.PIN_POSTS)) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        const post = this.postRepository.create({
            ...data,
            thread
        });
        post.author = user;
        post.id = uid.getUniqueID() as string;
        post.views = 0;
        await this.postRepository.save(post);
        return this.postToResponseObject(post);

    }

    async updatePost(userId: string, id: string, data: Partial < PostDTO > ) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['categories', 'roles', 'threads', 'posts']
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        let post = await this.postRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'thread', 'downvotes', 'upvotes']
        });

        if (!post) {
            throw new HttpException('Invalid post', HttpStatus.BAD_REQUEST);
        }

        const thread = await this.threadRepository.findOne({
            where: {
                id: data.thread
            }
        });

        if (data.thread) {
            if (!thread) {
                throw new HttpException('Invalid thread', HttpStatus.BAD_REQUEST);
            }
        }

        if (!user.hasPermission(Permissions.EDIT_POSTS) && post.author.id !== userId) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        await this.postRepository.update(id, {
            ...data,
            thread
        });
        post = await this.postRepository.findOne({
            where: {
                id
            },
            relations: ['author', 'thread', 'downvotes', 'upvotes']
        });
        return this.postToResponseObject(post);

    }

    async deletePost(userId: string, id: string) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['categories', 'roles', 'threads', 'posts']
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const post = await this.postRepository.findOne({
            where: {
                id
            }
        });

        if (!post) {
            throw new HttpException('Invalid post', HttpStatus.BAD_REQUEST);
        }

        if (!user.hasPermission(Permissions.DELETE_POSTS) && post.author.id !== user.id) {
            throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
        }

        await this.postRepository.delete(id);
        return this.postToResponseObject(post);

    }

    private async vote(post: PostEntity, user: UserEntity, vote: Votes) {

        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;

        if (post[opposite].filter(voter => voter.id === user.id).length > 0) {

            post[opposite] = post[opposite].filter(voter => voter.id !== user.id);

            post[vote].push(user);

            await this.postRepository.save(post);

        } else if (post[vote].filter(voter => voter.id === user.id).length > 0) {

            post[vote] = post[vote].filter(voter => voter.id !== user.id);

            await this.postRepository.save(post);

        } else if (post[vote].filter(voter => voter.id === user.id).length < 1) {

            post[vote].push(user);

            await this.postRepository.save(post);

        } else {
            throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }

        return this.postToResponseObject(post);
    }

    async upvote(userId: string, postId: string) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['categories', 'roles', 'threads', 'posts']
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const post = await this.postRepository.findOne({
            where: {
                id: postId
            },
            relations: ['author', 'thread', 'upvotes', 'downvotes']
        });

        if (!post) {
            throw new HttpException('Invalid post', HttpStatus.BAD_REQUEST);
        }

        return await this.vote(post, user, Votes.UP);

    }

    async downvote(userId: string, postId: string) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: ['categories', 'roles', 'threads', 'posts']
        });

        if (!user) {
            throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
        }

        const post = await this.postRepository.findOne({
            where: {
                id: postId
            },
            relations: ['author', 'thread', 'upvotes', 'downvotes']
        });

        if (!post) {
            throw new HttpException('Invalid post', HttpStatus.BAD_REQUEST);
        }

        return await this.vote(post, user, Votes.DOWN);

    }

}
