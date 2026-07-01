import { BaseRepository } from './BaseRepository';
import { Post } from '../database/models/Post';
import { User } from '../database/models/User';
import { Category } from '../database/models/Category';

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post);
  }

  async findFeedPosts(options?: any, visibilities: string[] = ['public'], currentUserId?: number, followedUserIds: number[] = []): Promise<Post[]> {
    const { Op } = require('sequelize');
    
    let whereCondition: any = { status: 'active', visibility: { [Op.in]: visibilities } };

    if (currentUserId) {
      whereCondition = {
        status: 'active',
        [Op.or]: [
          { visibility: { [Op.in]: visibilities } },
          { visibility: 'followers', userId: { [Op.in]: followedUserIds } },
          { visibility: 'followers', userId: currentUserId },
          { visibility: 'private', userId: currentUserId }
        ]
      };
    }

    return this.findAll({
      where: whereCondition,
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] },
        { model: Category, attributes: ['id', 'name', 'slug'] }
      ],
      order: [['created_at', 'DESC']],
      ...options
    });
  }

  async findTrendingPosts(limit: number = 10, visibilities: string[] = ['public'], currentUserId?: number, followedUserIds: number[] = []): Promise<Post[]> {
    const { Op } = require('sequelize');
    
    let whereCondition: any = { status: 'active', visibility: { [Op.in]: visibilities } };

    if (currentUserId) {
      whereCondition = {
        status: 'active',
        [Op.or]: [
          { visibility: { [Op.in]: visibilities } },
          { visibility: 'followers', userId: { [Op.in]: followedUserIds } },
          { visibility: 'followers', userId: currentUserId },
          { visibility: 'private', userId: currentUserId }
        ]
      };
    }

    return this.findAll({
      where: whereCondition,
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
