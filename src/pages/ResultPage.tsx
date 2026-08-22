import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Sparkles, Copy, Check, Loader2, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Showcase } from '@/types';
import ReimaginedPage from '@/components/ReimaginedPage';
import OriginalListing from '@/components/OriginalListing';

type View = 'reimagined' | 'original';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showcase, setShowcase] = useState<Showcase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('reimagined');
  const [copied, setCopied] = useState(false);
  const [showToggle, setShowToggle] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('showcases')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        setError(error.message);
      } else if (!data) {
        setError('Showcase not found.');
      } else {
        setShowcase(data as Showcase);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: showcase?.original_title || 'ShelfReel Showcase',
          text: 'Check out this cinematic product page',
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // Hide toggle bar when scrolled on reimagined view
  useEffect(() => {
    const onScroll = () => {
      setShowToggle(window.scrollY < 100);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-4" />
        <p className="text-white/50">Loading your showcase...</p>
      </div>
    );
  }

  if (error || !showcase) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center px-6">
        <p className="text-2xl font-display font-bold mb-2">{error || 'Showcase not found'}</p>
        <p className="text-white/40 mb-6">This showcase may have been removed or the link is incorrect.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-white text-black rounded-full font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to ShelfReel
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating toggle + share bar */}
      <AnimatePresence>
        {showToggle && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl"
          >
            <button
              onClick={() => navigate('/')}
              className="px-3 py-2 rounded-full text-white/60 hover:text-white transition-colors"
              title="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-white/5 rounded-full p-1">
              <button
                onClick={() => setView('reimagined')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  view === 'reimagined' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                Reimagined
              </button>
              <button
                onClick={() => setView('original')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                  view === 'original' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                Original
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-full text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
              title="Copy link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Copied!</span>
                </>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-full text-white/60 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show toggle button when hidden */}
      {!showToggle && (
        <motion.button
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          {view === 'reimagined' ? 'Reimagined' : 'Original'} — scroll up to toggle
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {view === 'reimagined' ? (
          <motion.div
            key="reimagined"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReimaginedPage showcase={showcase} />
          </motion.div>
        ) : (
          <motion.div
            key="original"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OriginalListing showcase={showcase} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
