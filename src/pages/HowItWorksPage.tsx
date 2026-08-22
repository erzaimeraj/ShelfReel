import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, Palette, Wand2, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const navigate = useNavigate();

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

      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 mb-6">
            Case Study
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-balance">
            How ShelfReel works
          </h1>
          <p className="text-white/50 text-lg mb-12">
            Small sellers have flat, unstyled product listings and no design budget to fix that. ShelfReel turns any listing into a cinematic landing page — live, from real content.
          </p>
        </motion.div>

        {/* Problem */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold mb-4">The problem</h2>
          <p className="text-white/60 leading-relaxed mb-3">
            Marketplaces like Etsy, eBay, and even Shopify defaults give sellers a plain text box and a photo upload. The result: every product page looks the same — a title, a price, a block of text, and an image floating in white space.
          </p>
          <p className="text-white/60 leading-relaxed">
            For makers and small brands, this is a visibility problem. The product might be beautiful, but the listing doesn't convey that. Hiring a designer or a copywriter for every single product isn't realistic at their price point.
          </p>
        </motion.section>

        {/* Solution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold mb-4">The approach</h2>
          <p className="text-white/60 leading-relaxed mb-6">
            ShelfReel takes the real product title, price, description, and photo, then uses Google Gemini for two narrowly scoped tasks:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Copywriting</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Gemini takes the real, user-submitted title and description and writes a punchier headline plus 2-3 benefit-focused blurbs. The key constraint: it only rephrases and elevates claims already present — it never invents specs, ingredients, guarantees, or features that weren't provided.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-rose-300" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Color theme extraction</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Gemini analyzes the submitted product image and returns a palette — primary, accent, background, surface, and text colors — that the generated page's entire theme is built from. Each showcase feels visually tailored to that specific product.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* The guardrail */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex gap-4 p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-3">The trust guardrail</h2>
              <p className="text-white/60 leading-relaxed mb-3">
                The AI copywriting constraint is a deliberate trust decision, not just a technical detail. When a tool rewrites product copy, the temptation is to make it sound impressive — which often means inventing claims the product can't back up. A handmade mug becomes "dishwasher-safe" when it isn't. A gadget gets "12-hour battery life" that was never tested.
              </p>
              <p className="text-white/60 leading-relaxed">
                ShelfReel's system prompt explicitly forbids this. The AI can only rephrase and elevate what's already in the listing. If the original description is sparse, the generated copy is proportionally restrained. Elegance over hype. This makes the tool safe for real sellers to use on real products — the showcase is always faithful to what they actually sell.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display text-2xl font-bold mb-4">Under the hood</h2>
          <ul className="space-y-2 text-white/50 text-sm">
            <li className="flex gap-3"><span className="text-white/30">•</span> React + TypeScript + Tailwind CSS for the frontend</li>
            <li className="flex gap-3"><span className="text-white/30">•</span> Framer Motion for scroll-triggered reveals, parallax, and staggered animations</li>
            <li className="flex gap-3"><span className="text-white/30">•</span> Supabase (Postgres) for persistent storage — every showcase saved and retrievable via unique URL</li>
            <li className="flex gap-3"><span className="text-white/30">•</span> Supabase Storage for product images</li>
            <li className="flex gap-3"><span className="text-white/30">•</span> Supabase Edge Functions proxying Google Gemini Flash API calls (copywriting + multimodal color extraction)</li>
            <li className="flex gap-3"><span className="text-white/30">•</span> Playfair Display (editorial serif) + Inter (clean sans) typography pairing</li>
          </ul>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center pt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-black font-semibold transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Try it yourself
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
