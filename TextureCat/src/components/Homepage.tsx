import { useState, useEffect } from 'react';
import { BookOpen, Download, Users, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HomepageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  user: any;
}

export default function Homepage({ onGetStarted, onLogin, user }: HomepageProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: usersData } = await supabase.rpc('get_unique_users_count');
    const { data: downloadsData } = await supabase.rpc('get_total_downloads_count');

    setStats({
      totalUsers: usersData || 0,
      totalDownloads: downloadsData || 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="relative z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TextureCat</span>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <button
                onClick={onLogin}
                className="px-6 py-2.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg font-medium text-gray-700 transition-all"
              >
                Log In
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="font-medium text-gray-900">{user.user_metadata?.full_name || user.email}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-8 pt-16 pb-24">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-center max-w-4xl">
            <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              It's more than a tool.
              <br />
              <span className="block mt-2">It's your creative future.</span>
            </h1>

            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
              Made by <span className="font-bold text-gray-900">ItsIgorYT</span>, specifically for Texture Pack Creators.
              Built-in pixel art editor included.
            </p>

            <button
              onClick={user ? onGetStarted : onLogin}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl mt-8"
            >
              Start Now
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-gray-500 mt-4">
              Yes, it's free. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-20 w-full max-w-3xl">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">Active Creators</div>
                </div>
              </div>
              <p className="text-gray-600">
                Join our growing community of texture pack creators
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <Download className="w-7 h-7 text-cyan-600" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalDownloads.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">Packs Created</div>
                </div>
              </div>
              <p className="text-gray-600">
                Resource packs designed and downloaded by creators
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">Everything You Need</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl mb-5 flex items-center justify-center mx-auto">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Pixel Art Editor</h3>
              <p className="text-gray-600 leading-relaxed">
                Edit textures directly in your browser with our powerful built-in editor
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl mb-5 flex items-center justify-center mx-auto">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Cloud Storage</h3>
              <p className="text-gray-600 leading-relaxed">
                Save and access your projects from anywhere, anytime
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl mb-5 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Easy Sharing</h3>
              <p className="text-gray-600 leading-relaxed">
                Export and share your creations with the community instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-500 text-sm">
          Made with passion by ItsIgorYT
        </div>
      </footer>
    </div>
  );
}
