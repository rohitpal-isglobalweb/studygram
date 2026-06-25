import React, { useState, useEffect, useRef } from 'react';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { Sparkles, Brain, Award } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const loadingMore = false;
  const isDone = true;
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const postsRes = await apiClient.get('/posts/feed');
      if (postsRes && postsRes.data) {
        const mapped = postsRes.data.map((p: any) => ({
          id: String(p.id),
          authorName: p.user?.name || 'Anonymous User',
          authorUsername: p.user?.username || 'anonymous',
          authorAvatar: p.user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          type: p.contentType === 'note' ? 'notes' : p.contentType,
          mediaUrl: p.mediaUrl,
          notesTitle: p.title,
          notesPages: 4,
          caption: p.description,
          category: p.category?.name || 'General',
          tags: [],
          likesCount: p.likesCount || 0,
          commentsCount: p.commentsCount || 0,
          hasLiked: false,
          hasSaved: false,
          createdAt: new Date(p.createdAt).toLocaleDateString()
        }));
        setPosts(mapped);
      }

      // Fetch categories
      const catRes = await apiClient.get('/categories');
      if (catRes && catRes.data) {
        const list = ['All', ...catRes.data.map((c: any) => c.name)];
        setCategories(list);
      }
    } catch (err) {
      console.error('Error loading feed data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/10">
        <div className="absolute right-4 top-4 opacity-10">
          <Brain className="w-40 h-40" />
        </div>
        <div className="relative z-10 space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Productivity Tip of the Day
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-heading">Keep the momentum going!</h2>
          <p className="text-sm text-indigo-100 leading-relaxed">
            "Use the Pomodoro technique: study for 25 minutes, take a 5-minute break. Repeat 4 times then take a longer break. Stay focused!"
          </p>
        </div>
      </div>

      {/* Categories Filter Carousel */}
      <div className="overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-2.5">
          {categories.map(category => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feed List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-semibold">
            No posts found in this category.
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}

        {/* Loading Skeletons for older pages */}
        {loadingMore && (
          <div className="space-y-6">
            <PostSkeleton />
          </div>
        )}

        <div ref={loaderRef} className="h-1" />

        {isDone && !loading && (
          <div className="text-center py-6 text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            You've caught up with all posts!
          </div>
        )}
      </div>
    </div>
  );
};
