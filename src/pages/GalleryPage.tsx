import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Showcase } from '@/types';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('showcases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(24);
      if (!error && data) {
        setShowcases(data as Showcase[]);
      }
      setLoading(false);
    })();
  }, []);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">ShelfReel</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Gallery</h1>
          <p className="text-white/40 text-lg">
            Recently reimagined product showcases. Click any to view the full cinematic page.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-white/5 shimmer" />
            ))}
          </div>
        ) : showcases.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/40 text-lg mb-4">No showcases yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-white text-black rounded-full font-medium"
            >
              Create the first one
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {showcases.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => navigate(`/reel/${s.id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group text-left"
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 relative">
                  {s.image_url ? (
                    <img
                      src={s.image_url}
                      alt={s.original_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  )}
                  {s.theme && (
                    <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
                      <div className="flex-1" style={{ backgroundColor: s.theme.primary }} />
                      <div className="flex-1" style={{ backgroundColor: s.theme.accent }} />
                      <div className="flex-1" style={{ backgroundColor: s.theme.background }} />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-sm text-white/90 truncate">
                    {s.generated_headline || s.original_title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-white/40 truncate flex-1">{s.original_title}</p>
                    <span className="text-xs text-white/30 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(s.created_at)}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
