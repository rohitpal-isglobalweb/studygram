import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../database/models/User';
import { Post } from '../database/models/Post';
import { Category } from '../database/models/Category';
import { Op } from 'sequelize';

export class SearchController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) throw new Error('Search query parameter "q" is required.');

      const term = String(q);

      // Search users
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${term}%` } },
            { username: { [Op.like]: `%${term}%` } }
          ],
          status: 'active'
        },
        attributes: ['id', 'uuid', 'name', 'username', 'profileImage', 'bio'],
        limit: 10
      });

      // Search posts
      const posts = await Post.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${term}%` } },
            { description: { [Op.like]: `%${term}%` } }
          ],
          status: 'active',
          visibility: 'public'
        },
        include: [
          { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
        ],
        limit: 10
      });

      // Search categories
      const categories = await Category.findAll({
        where: {
          name: { [Op.like]: `%${term}%` },
          status: 'active'
        },
        limit: 10
      });

      res.status(200).json({
        status: 'success',
        data: {
          users,
          posts,
          categories
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
