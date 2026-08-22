import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import type { Showcase, ThemePalette } from '@/types';

interface Props {
  showcase: Showcase;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const vals = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
}

function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ReimaginedPage({ showcase }: Props) {
  const theme: ThemePalette = showcase.theme || {
    primary: '#c2845a',
    accent: '#e8a87c',
    background: '#f8f5f0',
    surface: '#ffffff',
    text: '#2a2a2a',
    textMuted: '#6b6b6b',
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const blurbs = showcase.generated_blurbs || [];
  const isDark = relativeLuminance(theme.background) < 0.3;

  useEffect(() => {
    document.body.style.backgroundColor = theme.background;
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [theme.background]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full grain"
      style={{ backgroundColor: theme.background, color: theme.text }}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient color blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
            style={{ backgroundColor: theme.primary }}
          />
          <div
            className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-20"
            style={{ backgroundColor: theme.accent }}
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 md:gap-16 items-center"
        >
          {/* Text side */}
          <div className="order-2 md:order-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase mb-6"
              style={{
                backgroundColor: withAlpha(theme.primary, 0.15),
                color: theme.primary,
              }}
            >
              {showcase.original_price || 'Premium Product'}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-balance mb-6"
              style={{ color: theme.text }}
            >
              {showcase.generated_headline || showcase.original_title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0"
              style={{ color: theme.textMuted }}
            >
              {blurbs[0] || showcase.original_description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start"
            >
              <button
                className="px-7 py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: theme.accent,
                  color: relativeLuminance(theme.accent) > 0.5 ? '#1a1a1a' : '#ffffff',
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                className="px-7 py-3.5 rounded-full font-semibold text-sm border transition-all hover:scale-105"
                style={{
                  borderColor: withAlpha(theme.text, 0.2),
                  color: theme.text,
                }}
              >
                Learn More
              </button>
            </motion.div>
          </div>

          {/* Image side */}
          <div className="order-1 md:order-2 relative">
            <motion.div
              style={{ y: imageY, scale: imageScale }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
            >
              {showcase.image_url ? (
                <img
                  src={showcase.image_url}
                  alt={showcase.original_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: theme.surface }}
                >
                  <span style={{ color: theme.textMuted }}>No image</span>
                </div>
              )}
            </motion.div>

            {/* Floating accent ring */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute -inset-4 rounded-3xl border pointer-events-none -z-10"
              style={{ borderColor: withAlpha(theme.primary, 0.2) }}
            />
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ opacity: heroOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest" style={{ color: theme.textMuted }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8"
            style={{ backgroundColor: theme.textMuted }}
          />
        </motion.div>
      </section>

      {/* Benefits Section */}
      {blurbs.length > 0 && (
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2
                className="font-display text-3xl md:text-5xl font-bold mb-4"
                style={{ color: theme.text }}
              >
                Why you'll love it
              </h2>
              <p className="text-base" style={{ color: theme.textMuted }}>
                Every detail, reimagined.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {blurbs.map((blurb, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="p-6 md:p-8 rounded-2xl"
                  style={{
                    backgroundColor: theme.surface,
                    boxShadow: isDark
                      ? `0 4px 24px ${withAlpha('#000000', 0.3)}`
                      : `0 4px 24px ${withAlpha(theme.primary, 0.08)}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-4 font-display font-bold text-lg"
                    style={{
                      backgroundColor: withAlpha(theme.primary, 0.15),
                      color: theme.primary,
                    }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-base leading-relaxed" style={{ color: theme.text }}>
                    {blurb}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full-width image feature */}
      {showcase.image_url && (
        <section className="relative py-24 md:py-32 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={showcase.image_url}
              alt={showcase.original_title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${withAlpha(theme.background, 0.3)}, ${theme.background})`,
              }}
            />
          </motion.div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-display text-3xl md:text-5xl font-bold mb-6 text-balance"
              style={{ color: isDark ? '#ffffff' : theme.text }}
            >
              {showcase.original_title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-lg"
              style={{ color: isDark ? 'rgba(255,255,255,0.7)' : theme.textMuted }}
            >
              {showcase.original_description}
            </motion.p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2
            className="font-display text-3xl md:text-5xl font-bold mb-6 text-balance"
            style={{ color: theme.text }}
          >
            Ready to make it yours?
          </h2>
          <p className="text-lg mb-8" style={{ color: theme.textMuted }}>
            {showcase.original_price ? `Available for ${showcase.original_price}.` : 'Available now.'}
          </p>
          <button
            className="px-8 py-4 rounded-full font-semibold text-base inline-flex items-center gap-2 transition-all hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: theme.accent,
              color: relativeLuminance(theme.accent) > 0.5 ? '#1a1a1a' : '#ffffff',
            }}
          >
            <ShoppingBag className="w-5 h-5" />
            Buy Now
          </button>
        </motion.div>
      </section>

      {/* Contact note */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: withAlpha(theme.text, 0.1) }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
            Want a showcase like this for your real store?
          </p>
          <p className="text-sm" style={{ color: theme.text }}>
            Reach out to <span className="font-semibold">ShelfReel</span> — we turn flat listings into cinematic pages.
          </p>
          <p className="text-xs mt-3" style={{ color: theme.textMuted }}>
            Generated by ShelfReel · Turn any product listing into a cinematic landing page
          </p>
        </div>
      </footer>
    </div>
  );
}
