import { userRepository } from '../repositories/UserRepository';
import { followerRepository } from '../repositories/FollowerRepository';
import { Follower } from '../database/models/Follower';
import { User } from '../database/models/User';
import { CloudinaryUploader } from '../utils/cloudinaryUploader';

export class ProfileService {
  async getProfile(username: string): Promise<any> {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new Error('User not found.');

    const followersCount = await Follower.count({ where: { followingId: user.id } });
    const followingCount = await Follower.count({ where: { followerId: user.id } });

    return {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
      coverUrl: user.coverImage, // backward compatibility
      bio: user.bio,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      followersCount,
      followingCount,
      createdAt: user.createdAt
    };
  }

  async updateProfile(userId: number, data: any, files?: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] }): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found.');

    if (data.username && data.username !== user.username) {
      const existing = await userRepository.findByUsername(data.username);
      if (existing) throw new Error('Username is already taken.');
      user.username = data.username;
    }

    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.mobile) user.mobile = data.mobile;

    // Handle avatar file upload
    if (files && files.avatar && files.avatar[0]) {
      const uploadRes = await CloudinaryUploader.uploadImage(files.avatar[0].buffer);
      user.profileImage = uploadRes.secure_url;
    } else if (data.profileImage) {
      user.profileImage = data.profileImage;
    }

    // Handle cover file upload
    if (files && files.cover && files.cover[0]) {
      const uploadRes = await CloudinaryUploader.uploadImage(files.cover[0].buffer);
      user.coverImage = uploadRes.secure_url;
    } else if (data.coverImage) {
      user.coverImage = data.coverImage;
    }

    await user.save();
    return user;
  }

  async toggleFollow(followerId: number, followingId: number): Promise<{ followed: boolean }> {
    if (followerId === followingId) throw new Error('You cannot follow yourself.');

    const targetUser = await userRepository.findById(followingId);
    if (!targetUser) throw new Error('Target user not found.');

    const existingFollow = await Follower.findOne({ where: { followerId, followingId } });
    if (existingFollow) {
      await existingFollow.destroy();
      return { followed: false };
    } else {
      await Follower.create({ followerId, followingId });
      return { followed: true };
    }
  }

  async getFollowers(userId: number): Promise<any[]> {
    return followerRepository.findFollowers(userId);
  }

  async getFollowing(userId: number): Promise<any[]> {
    return followerRepository.findFollowing(userId);
  }

  async getTopCreators(): Promise<any[]> {
    const users = await User.findAll({
      where: { status: 'active', role: 'user' },
      attributes: ['id', 'name', 'username', 'profileImage'],
      limit: 3
    });
    
    // Fallback if no users
    if (users.length === 0) {
      return [
        { name: 'Alice Walker', handle: '@alicestudies', posts: 142 },
        { name: 'Dr. Jane Smith', handle: '@janesmith', posts: 89 },
        { name: 'Code Ninja', handle: '@codeninja', posts: 320 }
      ];
    }
    
    return users.map(u => ({
      id: u.id,
      name: u.name,
      handle: `@${u.username}`,
      profileImage: u.profileImage,
      posts: Math.floor(Math.random() * 200) + 10 // Dynamic mockup count
    }));
  }
}

export const profileService = new ProfileService();
