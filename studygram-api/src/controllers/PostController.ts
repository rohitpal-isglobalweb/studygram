import { Response, NextFunction } from 'express';
import { postService } from '../services/PostService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class PostController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await postService.createPost({
        ...req.body,
        userId: req.user!.id
      }, req.file);

      res.status(211).json({
        status: 'success',
        message: 'Post published successfully.',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const feed = await postService.getFeed();
      res.status(200).json({
        status: 'success',
        data: feed
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const trending = await postService.getTrending();
      res.status(200).json({
        status: 'success',
        data: trending
      });
    } catch (error) {
      next(error);
    }
  }

  async like(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.body;
      if (!postId) throw new Error('postId is required.');

      const userId = req.user!.id;
      await postService.likePost(userId, Number(postId));

      res.status(200).json({
        status: 'success',
        message: 'Action completed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async comment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId, content } = req.body;
      if (!postId || !content) throw new Error('postId and content are required.');

      const userId = req.user!.id;
      const comment = await postService.addComment(userId, Number(postId), content);

      res.status(211).json({
        status: 'success',
        message: 'Comment added.',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const comments = await postService.getComments(Number(postId));
      res.status(200).json({
        status: 'success',
        data: comments
      });
    } catch (error) {
      next(error);
    }
  }

  async save(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.body;
      if (!postId) throw new Error('postId is required.');

      const userId = req.user!.id;
      const result = await postService.savePost(userId, Number(postId));

      res.status(200).json({
        status: 'success',
        message: result.saved ? 'Post saved.' : 'Post unsaved.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getSaved(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const savedPosts = await postService.getSavedPosts(userId);

      res.status(200).json({
        status: 'success',
        data: savedPosts
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = req.user!.id;
      
      await postService.deletePost(userId, Number(postId));

      res.status(200).json({
        status: 'success',
        message: 'Post deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tags = await postService.getTrendingTags();
      res.status(200).json({
        status: 'success',
        data: tags
      });
    } catch (error) {
      next(error);
    }
  }
}
export const postController = new PostController();
