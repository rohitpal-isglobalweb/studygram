import React, { useState, useEffect } from 'react';
import { Film, ArrowLeft, Heart, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

export const Reels: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Load active categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response && response.data) {
        setCategories(response.data);
      }
    } catch (e) {
      console.error('Error fetching categories for reels:', e);
    }
  };

  const selectCategory = async (cat: any) => {
    setSelectedCategory(cat);
    setLoading(true);
    try {
      // Get posts feed and filter for video content in the selected category
      const response = await apiClient.get('/posts/feed');
      if (response && response.data) {
        const videoPosts = response.data
          .filter((p: any) => p.contentType === 'video' && p.categoryId === cat.id)
          .map((p: any) => ({
            id: String(p.id),
            title: p.title,
            caption: p.description,
            mediaUrl: p.mediaUrl,
            authorName: p.user?.name || 'Anonymous Creator',
            authorAvatar: p.user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            likesCount: p.likesCount || 0,
            commentsCount: p.commentsCount || 0
          }));
        setReels(videoPosts);
      }
    } catch (e) {
      console.error('Error loading reels:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-[80vh] flex flex-col justify-center">
      {!selectedCategory ? (
        // Category Selection Screen
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl mb-2">
              <Film className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold font-heading">Study Reels</h2>
            <p className="text-sm text-slate-500">Select a category to start watching short educational videos.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition shadow-sm hover:shadow-md"
              >
                <span className="text-2xl mb-2">🎓</span>
                <span className="font-bold text-sm font-heading">{cat.name}</span>
                <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Explore Video Notes</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Reels Player Feed Screen
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setReels([]);
              }}
              className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-lg font-heading">{selectedCategory.name} Reels</h3>
              <p className="text-xs text-slate-500">Scroll vertically for next video</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500 font-semibold">Loading reels...</div>
          ) : reels.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
              <p className="text-slate-500 font-semibold">No reels available for this category yet.</p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-5 rounded-xl transition text-sm cursor-pointer"
              >
                Choose another Category
              </button>
            </div>
          ) : (
            // Full Screen Vertical Reel List
            <div className="flex-1 flex justify-center items-center">
              <div className="w-full max-w-sm h-[650px] relative bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end">
                {/* Scroll Container (simulated single reel for simple view with scrolling support) */}
                {reels.map((reel) => (
                  <div key={reel.id} className="absolute inset-0 w-full h-full flex flex-col justify-end">
                    <video
                      src={reel.mediaUrl}
                      loop
                      autoPlay
                      muted={isMuted}
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Mute toggle button */}
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white z-20 cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                    {/* Reels Details Sidebar Overlay */}
                    <div className="absolute right-4 bottom-24 flex flex-col gap-5 z-20 text-white items-center">
                      <button 
                        onClick={async () => {
                          try {
                            await apiClient.post('/posts/like', { postId: Number(reel.id) });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:scale-110 transition">
                          <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
                        </div>
                        <span className="text-xs font-semibold">{reel.likesCount}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1 cursor-pointer">
                        <div className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:scale-110 transition">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold">{reel.commentsCount}</span>
                      </button>
                    </div>

                    {/* Reels Bottom Details (Author, Caption) */}
                    <div className="p-6 z-20 text-white space-y-3 max-w-[80%]">
                      <div className="flex items-center gap-3">
                        <img src={reel.authorAvatar} alt="author" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500" />
                        <span className="font-bold text-sm">@{reel.authorName}</span>
                      </div>
                      <h4 className="font-extrabold text-sm">{reel.title}</h4>
                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{reel.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
