import { BaseRepository } from './BaseRepository';
import { Post } from '../database/models/Post';
import { User } from '../database/models/User';
import { Category } from '../database/models/Category';

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post);
  }

  async findFeedPosts(options?: any): Promise<Post[]> {
    return this.findAll({
      where: { status: 'active', visibility: 'public' },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] },
        { model: Category, attributes: ['id', 'name', 'slug'] }
      ],
      order: [['created_at', 'DESC']],
      ...options
    });
  }

  async findTrendingPosts(limit: number = 10): Promise<Post[]> {
    return this.findAll({
      where: { status: 'active', visibility: 'public' },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ],
      order: [
        ['likesCount', 'DESC'],
        ['viewsCount', 'DESC']
      ],
      limit
    });
  }
}
export const postRepository = new PostRepository();
