import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Upload, Sparkles, Image as ImageIcon, Loader2, ArrowRight, Wand2 } from 'lucide-react';
import { supabase, STORAGE_BUCKET, EDGE_FUNCTION_URL } from '@/lib/supabase';
import type { Showcase } from '@/types';

type Mode = 'url' | 'manual';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('manual');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progressMessages = [
    'Reading your listing...',
    'Extracting color palette...',
    'Writing new copy...',
    'Building your page...',
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startProgressAnimation = () => {
    setProgressStep(0);
    const interval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev >= progressMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return interval;
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop() || 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, imageFile, { contentType: imageFile.type });
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async () => {
    setError(null);

    if (mode === 'url') {
      if (!url.trim()) {
        setError('Please paste a product URL.');
        return;
      }
      // URL mode: we don't scrape (no server-side scraper in this env), so we
      // guide the user to manual entry with a friendly note.
      setError('For best results, switch to manual entry and paste the product title, price, description, and upload the product photo. URL scraping requires a dedicated backend that isn\'t available in this environment.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter the product title.');
      return;
    }
    if (!imageFile) {
      setError('Please upload a product photo — it drives the color theme.');
      return;
    }

    setLoading(true);
    const interval = startProgressAnimation();

    try {
      const imageUrl = await uploadImage();

      const res = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          price: price.trim() || undefined,
          description: description.trim() || undefined,
          imageUrl,
          sourceType: 'manual',
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${res.status})`);
      }

      const data = await res.json();
      if (!data.id) throw new Error('No showcase ID returned.');

      // Advance to final step then navigate
      setProgressStep(progressMessages.length - 1);
      clearInterval(interval);
      setTimeout(() => navigate(`/reel/${data.id}`), 600);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">ShelfReel</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <button onClick={() => navigate('/gallery')} className="hover:text-white transition-colors">Gallery</button>
        </div>
      </nav>

      {/* Hero + Form */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-6">
            <Wand2 className="w-3 h-3" />
            AI-powered product storytelling
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] text-balance mb-4">
            Turn any product listing<br />into a <span className="italic bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">cinematic landing page</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Paste your listing details and upload a photo. ShelfReel reimagines it as a polished, animated showcase — built live from your real content.
          </p>
          <p className="text-white/30 text-sm mt-3">
            No sign-up. Real product photo, real listing details — just reimagined.
          </p>
        </motion.div>

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-2 mb-6"
        >
          <button
            onClick={() => { setMode('manual'); setError(null); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'manual'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/10'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => { setMode('url'); setError(null); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'url'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/50 hover:text-white/80 border border-white/10'
            }`}
          >
            Product URL
          </button>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {mode === 'url' ? (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-white/70 mb-2">Product URL</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://etsy.com/listing/..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
                <p className="text-xs text-white/30 mt-3">
                  Paste a link to your product listing. For best results in this demo, use Manual Entry with the product photo.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Product Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Handmade Ceramic Mug"
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Price</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="$32.00"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Product Photo *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-black/30 border border-dashed border-white/20 rounded-xl px-4 py-3 text-white/50 hover:text-white/70 hover:border-white/40 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {imagePreview ? (
                        <span className="flex items-center gap-2 text-white/80">
                          <ImageIcon className="w-4 h-4" />
                          Photo selected
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Upload image
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Short Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product — materials, dimensions, what makes it special..."
                    rows={3}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
                  />
                </div>
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-amber-400 to-rose-500 text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Reimagining...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Reimagine It
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </motion.div>

        {/* Loading progress */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-2"
            >
              {progressMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                    i <= progressStep ? 'text-white/80' : 'text-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    i < progressStep
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : i === progressStep
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-white/5 text-white/20'
                  }`}>
                    {i < progressStep ? '✓' : i + 1}
                  </div>
                  {msg}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works section */}
        <div id="how" className="mt-24 pt-12 border-t border-white/10">
          <h2 className="font-display text-2xl font-bold text-center mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📝', title: 'Submit your listing', desc: 'Paste the product title, price, and description. Upload the real product photo.' },
              { icon: '🎨', title: 'AI extracts the palette', desc: 'Gemini analyzes your product image and builds a color theme tailored to that specific product.' },
              { icon: '✨', title: 'Get a cinematic page', desc: 'A polished, animated showcase with new copy — faithful to your original claims, never inventing new ones.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-white/90 mb-1">{step.title}</h3>
                <p className="text-sm text-white/40">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
