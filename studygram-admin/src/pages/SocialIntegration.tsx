import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../features/store';
import { updateSocialSettings } from '../features/moderationSlice';
import { Share2, Save } from 'lucide-react';
import { TextField } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';

export const SocialIntegration: React.FC = () => {
  const dispatch = useDispatch();
  const { social } = useSelector((state: RootState) => state.moderation);

  const [instagramKey, setInstagramKey] = useState(social.instagramKey);
  const [facebookKey, setFacebookKey] = useState(social.facebookKey);
  const [linkedinKey, setlinkedinKey] = useState(social.linkedinKey);
  const [youtubeKey, setYoutubeKey] = useState(social.youtubeKey);
  const [xKey, setXKey] = useState(social.xKey);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateSocialSettings({
      instagramKey,
      facebookKey,
      linkedinKey,
      youtubeKey,
      xKey
    }));
    alert('Social media integration API settings saved successfully.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-500" />
            Social Media Integration Settings
          </h3>
          <p className="text-xs text-slate-500 mt-1">Configure client API keys and access tokens for cross-platform sharing.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <InstagramIcon className="w-5 h-5 text-pink-500" />
              Instagram API Client Key
            </label>
            <TextField
              value={instagramKey}
              onChange={(e) => setInstagramKey(e.target.value)}
              placeholder="e.g. ig_client_secret_token"
              size="small"
              fullWidth
            />
          </div>

          {/* Facebook */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <FacebookIcon className="w-5 h-5 text-blue-700" />
              Facebook Graph API Token
            </label>
            <TextField
              value={facebookKey}
              onChange={(e) => setFacebookKey(e.target.value)}
              placeholder="e.g. fb_graph_secret_token"
              size="small"
              fullWidth
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <LinkedInIcon className="w-5 h-5 text-blue-600" />
              LinkedIn OAuth Credentials
            </label>
            <TextField
              value={linkedinKey}
              onChange={(e) => setlinkedinKey(e.target.value)}
              placeholder="e.g. li_oauth_access_token"
              size="small"
              fullWidth
            />
          </div>

          {/* YouTube */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <YouTubeIcon className="w-5 h-5 text-red-600" />
              YouTube Data API Key
            </label>
            <TextField
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              placeholder="e.g. yt_data_api_v3_key"
              size="small"
              fullWidth
            />
          </div>

          {/* X */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              X (formerly Twitter) Developer Token
            </label>
            <TextField
              value={xKey}
              onChange={(e) => setXKey(e.target.value)}
              placeholder="e.g. x_bearer_auth_token"
              size="small"
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/40">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-xl text-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Integration Settings
          </button>
        </div>
      </form>
    </div>
  );
};
