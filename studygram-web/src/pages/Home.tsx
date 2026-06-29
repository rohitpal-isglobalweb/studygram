import React, { useState, useEffect, useRef } from 'react';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/PostSkeleton';
import { Sparkles, Brain, Award, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState<{tag: string, count: number}[]>([]);
  const [topCreators, setTopCreators] = useState<any[]>([]);
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
          authorAvatar: p.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=6366f1&color=fff`,
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
      // Fetch tags and creators
      try {
        const [tagsRes, creatorsRes] = await Promise.all([
          apiClient.get('/posts/trending-tags'),
          apiClient.get('/users/top-creators')
        ]);
        if (tagsRes?.data) setTrendingTags(tagsRes.data);
        if (creatorsRes?.data) setTopCreators(creatorsRes.data);
      } catch (err) {
        console.error('Error loading trending/creators:', err);
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
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* Main Left Column */}
      <div className="space-y-8 max-w-2xl w-full mx-auto lg:mx-0">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-fuchsia-700 rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute right-4 top-4 opacity-10 animate-pulse">
            <Brain className="w-40 h-40" />
          </div>
          <div className="relative z-10 space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Tip of the Day
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-heading leading-tight tracking-tight">
              Keep the momentum going!
            </h2>
            <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed font-medium">
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
            <div className="text-center py-6 text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              You've caught up with all posts!
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (Responsive: bottom on mobile, right on desktop) */}
      <div className="flex flex-col space-y-8 lg:sticky lg:top-24 h-max order-last">
        {/* Trending Tags Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold font-heading text-lg">Trending Tags</h3>
          </div>
          <div className="space-y-4">
            {trendingTags.map((t) => (
              <div key={t.tag} className="flex flex-col group cursor-pointer">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                  {t.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">{t.count} posts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Creators Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold font-heading text-lg">Top Creators</h3>
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-5">
            {topCreators.map(user => (
              <div key={user.handle} onClick={() => navigate(`/profile/${user.handle.substring(1)}`)} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar src={user.profileImage} name={user.name} className="w-10 h-10 ring-2 ring-transparent group-hover:ring-indigo-500/20 transition-all" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{user.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{user.handle}</span>
                  </div>
                </div>
                <button className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400 px-2">
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition">About</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition">Help Center</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition">Terms</a>
          <span className="w-full mt-2">© 2026 StudyGram Inc.</span>
        </div>
      </div>
    </div>
  );
};
