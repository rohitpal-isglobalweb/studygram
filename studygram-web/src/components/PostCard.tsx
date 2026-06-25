import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';
import { apiClient } from '../utils/apiClient';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookOpen,
  Send,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';

export interface CommentData {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface PostCardProps {
  post: {
    id: string;
    authorName: string;
    authorUsername: string;
    authorAvatar: string;
    type: 'image' | 'video' | 'notes';
    mediaUrl: string;
    notesTitle?: string;
    notesPages?: number;
    caption: string;
    category: string;
    tags: string[];
    likesCount: number;
    commentsCount?: number;
    hasLiked: boolean;
    hasSaved: boolean;
    createdAt: string;
  };
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [hasSaved, setHasSaved] = useState(post.hasSaved);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Sync initial props
  useEffect(() => {
    setLikesCount(post.likesCount);
    setHasLiked(post.hasLiked);
    setHasSaved(post.hasSaved);
  }, [post]);

  // Load comments dynamically when dialog opens
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/posts/${post.id}/comments`);
      if (response.data) {
        const mapped = response.data.map((c: any) => ({
          id: String(c.id),
          authorName: c.user?.name || 'User',
          authorAvatar: c.user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          content: c.comment,
          timestamp: new Date(c.createdAt).toLocaleDateString()
        }));
        setComments(mapped);
        setCommentsCount(mapped.length);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      const originalHasLiked = hasLiked;
      setHasLiked(!hasLiked);
      setLikesCount(prev => prev + (!originalHasLiked ? 1 : -1));
      
      await apiClient.post('/posts/like', { postId: Number(post.id) });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleSave = async () => {
    try {
      setHasSaved(!hasSaved);
      await apiClient.post('/posts/save', { postId: Number(post.id) });
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      const response = await apiClient.post('/posts/comment', {
        postId: Number(post.id),
        content: commentText.trim()
      });
      
      if (response.data) {
        const newComment: CommentData = {
          id: String(response.data.id),
          authorName: user.fullName,
          authorAvatar: user.avatarUrl,
          content: commentText.trim(),
          timestamp: 'Just now'
        };
        setComments(prev => [...prev, newComment]);
        setCommentsCount(prev => prev + 1);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.notesTitle || 'StudyGram Post',
        text: post.caption,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Post link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md smooth-transition">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/10"
          />
          <div>
            <h3 className="text-sm font-semibold hover:text-indigo-600 cursor-pointer">{post.authorName}</h3>
            <p className="text-xs text-slate-500">@{post.authorUsername} • {post.createdAt}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreHorizontal className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
          {post.caption}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Media Rendering */}
      {post.type === 'notes' ? (
        <div className="relative border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl flex items-start gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">{post.notesTitle}</h4>
              <p className="text-xs text-slate-500 mt-1">{post.notesPages || 4} pages • PDF Document</p>
              <a 
                href={post.mediaUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-500 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 cursor-pointer"
              >
                View Notes
              </a>
            </div>
          </div>
        </div>
      ) : post.type === 'video' ? (
        <div className="relative border-y border-slate-200 dark:border-slate-800 bg-black flex items-center justify-center aspect-video max-h-[400px]">
          <video src={post.mediaUrl} controls className="w-full h-full max-h-[400px] object-contain" />
        </div>
      ) : (
        <div className="relative border-y border-slate-200 dark:border-slate-800 overflow-hidden aspect-square max-h-[450px] bg-slate-100 dark:bg-slate-950">
          <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              hasLiked ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
            {likesCount}
          </button>
          
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            {commentsCount}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-500 cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center text-xs font-semibold cursor-pointer ${
            hasSaved ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${hasSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Comments Dialog */}
      <Dialog
        open={showComments}
        onClose={() => setShowComments(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: 'background.paper',
            }
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: 'Outfit' }}>
          Comments
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <div className="flex flex-col h-[400px]">
            {/* Scrollable Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl rounded-tl-none">
                        <p className="text-xs font-semibold">{comment.authorName}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-sans">
                          {comment.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 ml-2 mt-1 block">{comment.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center bg-white dark:bg-slate-900">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Report Post</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Hide Post</MenuItem>
      </Menu>
    </article>
  );
};
