import { Response, NextFunction } from 'express';
import { postService } from '../services/PostService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { SocialMediaService } from '../services/SocialMediaService';

export class PostController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await postService.createPost({
        ...req.body,
        userId: req.user!.id
      }, req.file);

      // Trigger cross-publish if requested
      if (req.body.publishTo) {
        let platforms: string[] = [];
        try {
          // If it's sent as a JSON string (e.g., from FormData), parse it
          platforms = typeof req.body.publishTo === 'string' 
            ? JSON.parse(req.body.publishTo) 
            : req.body.publishTo;
        } catch(e) {
          console.warn('Could not parse publishTo');
        }

        if (Array.isArray(platforms) && platforms.length > 0) {
          SocialMediaService.publishPost(req.user!.id, post, platforms);
        }
      }

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
      const visibilities = ['public']; // The 'followers' visibility logic is now handled based on currentUserId
      const feed = await postService.getFeed({}, visibilities, req.user?.id);
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
      const visibilities = ['public']; 
      const trending = await postService.getTrending(visibilities, req.user?.id);
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
