import { postRepository } from '../repositories/PostRepository';
import { redisClient } from '../config/redis';
import { Post } from '../database/models/Post';
import { Like } from '../database/models/Like';
import { Comment } from '../database/models/Comment';
import { SavedPost } from '../database/models/SavedPost';
import { User } from '../database/models/User';
import { Follower } from '../database/models/Follower';
import { CloudinaryUploader } from '../utils/cloudinaryUploader';

export class PostService {
  async createPost(data: any, file?: Express.Multer.File): Promise<Post> {
    let mediaUrl = data.mediaUrl || '';
    let contentType = data.contentType || 'image';

    if (file) {
      // Determine content type from mime type
      if (file.mimetype.startsWith('image/')) {
        contentType = 'image';
        const uploadResult = await CloudinaryUploader.uploadImage(file.buffer);
        mediaUrl = uploadResult.secure_url;
      } else if (file.mimetype.startsWith('video/')) {
        contentType = 'video';
        const uploadResult = await CloudinaryUploader.uploadVideo(file.buffer);
        mediaUrl = uploadResult.secure_url;
      } else {
        contentType = 'note';
        const uploadResult = await CloudinaryUploader.uploadRaw(file.buffer, file.originalname);
        mediaUrl = uploadResult.secure_url;
      }
    }

    const post = await postRepository.create({
      ...data,
      mediaUrl,
      contentType
    });

    // Clear feed caches in Redis
    await redisClient.del('feed_posts_public');
    await redisClient.del('feed_posts_public_registered');
    return post;
  }

  async getFeed(options?: any, visibilities: string[] = ['public'], currentUserId?: number): Promise<Post[]> {
    if (currentUserId) {
      // Fetch followed users
      const follows = await Follower.findAll({ where: { followerId: currentUserId } });
      const followedUserIds = follows.map(f => f.followingId);
      
      // Bypass cache for personalized feed
      const posts = await postRepository.findFeedPosts(options, visibilities, currentUserId, followedUserIds);
      
      const postIds = posts.map(p => p.id);
      if (postIds.length === 0) return [];

      const likes = await Like.findAll({ where: { userId: currentUserId, postId: postIds } });
      const saves = await SavedPost.findAll({ where: { userId: currentUserId, postId: postIds } });
      
      const likedIds = new Set(likes.map(l => l.postId));
      const savedIds = new Set(saves.map(s => s.postId));

      return posts.map(p => {
        const postJson = p.toJSON() as any;
        postJson.hasLiked = likedIds.has(p.id);
        postJson.hasSaved = savedIds.has(p.id);
        return postJson;
      });
    }

    const cacheKey = `feed_posts_public`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const posts = await postRepository.findFeedPosts(options, visibilities);
    await redisClient.set(cacheKey, JSON.stringify(posts), { EX: 300 });
    return posts;
  }

  async getTrending(visibilities: string[] = ['public'], currentUserId?: number): Promise<Post[]> {
    if (currentUserId) {
      const follows = await Follower.findAll({ where: { followerId: currentUserId } });
      const followedUserIds = follows.map(f => f.followingId);
      const posts = await postRepository.findTrendingPosts(10, visibilities, currentUserId, followedUserIds);
      
      const postIds = posts.map(p => p.id);
      if (postIds.length === 0) return [];

      const likes = await Like.findAll({ where: { userId: currentUserId, postId: postIds } });
      const saves = await SavedPost.findAll({ where: { userId: currentUserId, postId: postIds } });
      
      const likedIds = new Set(likes.map(l => l.postId));
      const savedIds = new Set(saves.map(s => s.postId));

      return posts.map(p => {
        const postJson = p.toJSON() as any;
        postJson.hasLiked = likedIds.has(p.id);
        postJson.hasSaved = savedIds.has(p.id);
        return postJson;
      });
    }

    const cacheKey = `trending_posts_public`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const posts = await postRepository.findTrendingPosts(10, visibilities);
    await redisClient.set(cacheKey, JSON.stringify(posts), { EX: 600 });
    return posts;
  }

  async likePost(userId: number, postId: number): Promise<void> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found.');

    const existingLike = await Like.findOne({ where: { userId, postId } });
    if (existingLike) {
      await existingLike.destroy();
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      await Like.create({ userId, postId });
      post.likesCount += 1;
    }
    await post.save();
    await redisClient.del('feed_posts_public');
  }

  async addComment(userId: number, postId: number, text: string): Promise<Comment> {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error('Post not found.');

    const comment = await Comment.create({ userId, postId, comment: text });
    post.commentsCount += 1;
    await post.save();
    await redisClient.del('feed_posts_public');

    return comment;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return Comment.findAll({
      where: { postId },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ],
      order: [['created_at', 'ASC']]
    });
  }

  async savePost(userId: number, postId: number): Promise<{ saved: boolean }> {
    const existingSave = await SavedPost.findOne({ where: { userId, postId } });
    if (existingSave) {
      await existingSave.destroy();
      return { saved: false };
    } else {
      await SavedPost.create({ userId, postId });
      return { saved: true };
    }
  }

  async getSavedPosts(userId: number): Promise<Post[]> {
    const savedList = await SavedPost.findAll({
      where: { userId },
      attributes: ['postId']
    });

    const postIds = savedList.map(s => s.postId);
    if (postIds.length === 0) return [];

    return Post.findAll({
      where: { id: postIds, status: 'active' },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'profileImage'] }
      ]
    });
  }

  async deletePost(userId: number, postId: number): Promise<void> {
    const post = await Post.findOne({ where: { id: postId, userId } });
    if (!post) throw new Error('Post not found or unauthorized to delete.');
    
    // Delete associated records to avoid foreign key constraint failures
    await Like.destroy({ where: { postId } });
    await Comment.destroy({ where: { postId } });
    await SavedPost.destroy({ where: { postId } });

    await post.destroy();
  }

  async getTrendingTags(): Promise<{ tag: string, count: number }[]> {
    const posts = await Post.findAll({ attributes: ['description'] });
    const tagCounts: { [tag: string]: number } = {};
    posts.forEach(p => {
      if (p.description) {
        const matches = p.description.match(/#[a-zA-Z0-9_]+/g);
        if (matches) {
          matches.forEach(m => {
            const tag = m.toLowerCase();
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      }
    });
    
    let sorted = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
      
    return sorted;
  }
}
export const postService = new PostService();
