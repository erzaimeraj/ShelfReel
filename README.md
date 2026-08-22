# ShelfReel

> Turn any product listing into a cinematic landing page.

ShelfReel takes a plain product listing — title, price, description, and a real product photo — and generates a polished, animated, one-page cinematic showcase. Each showcase is saved and retrievable via its own unique URL. The color theme is extracted from the actual product image, so every result feels bespoke.

## What it does

1. **Submit a listing** — paste the product title, price, short description, and upload the product photo.
2. **AI does two things** — Google Gemini Flash rewrites the copy (faithful to original claims, never inventing new ones) and extracts a color palette from the product image.
3. **Get a cinematic page** — a hero with parallax, scroll-triggered benefit reveals, a color theme derived from the product, and a CTA. Shareable via its own URL.
4. **Before/after toggle** — compare the deliberately plain "Original Listing" view against the "Reimagined" cinematic page.

## The trust guardrail

The AI copywriting is constrained by design: it can only rephrase and elevate claims **already present** in the original listing. It never invents specs, ingredients, guarantees, or features. If the original description is sparse, the generated copy is proportionally restrained. This makes the tool safe for real sellers — the showcase is always faithful to what they actually sell.

## Tech stack

- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Supabase Edge Functions (Deno) proxying Google Gemini Flash API
- **Database:** Supabase Postgres — every showcase saved and retrievable via `/reel/:id`
- **Storage:** Supabase Storage for product images
- **AI:** Google Gemini 2.0 Flash (multimodal — accepts product image directly for color extraction)
- **Typography:** Playfair Display (editorial serif) + Inter (clean sans)

## Local setup

### Prerequisites

- Node.js 18+
- A Google Gemini API key (free tier) — get one at https://aistudio.google.com/apikey
- A Supabase project (or use the pre-provisioned one in Bolt)

### Installation

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (server-side secret, used by the edge function) |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### Database setup

The database schema and storage bucket are applied via Supabase migrations. In Bolt, these are handled automatically. If self-hosting, run the SQL from the migration files against your Supabase project:

1. Create the `showcases` table (see schema in the migration).
2. Create the `showcase-images` storage bucket (public).
3. Enable RLS and apply the policies.

### Deploy the edge function

The `generate-showcase` edge function handles Gemini API calls. In Bolt, it's deployed via the Supabase MCP tools. If self-hosting:

```bash
supabase functions deploy generate-showcase --no-verify-jwt
```

Then set the Gemini API key as a secret:

```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

### Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

## Deployment

### Frontend (Vite)

Deploy the static build to any static host (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Supabase Edge Functions)

The edge function is deployed to Supabase's serverless runtime. Ensure the `GEMINI_API_KEY` secret is set:

```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

### Database (Supabase Postgres)

The database and storage bucket are part of your Supabase project. No additional deployment needed.

## Project structure

```
src/
├── components/
│   ├── ReimaginedPage.tsx    # The cinematic showcase page
│   └── OriginalListing.tsx  # The deliberately plain original view
├── pages/
│   ├── LandingPage.tsx       # Home with submission form
│   ├── ResultPage.tsx        # /reel/:id — before/after toggle
│   ├── GalleryPage.tsx       # Recent showcases portfolio
│   └── HowItWorksPage.tsx    # Case study write-up
├── lib/
│   └── supabase.ts           # Supabase client singleton
├── types.ts                  # TypeScript types
├── App.tsx                   # Router
└── main.tsx                  # Entry point

supabase/
└── functions/
    └── generate-showcase/
        └── index.ts          # Gemini AI calls (copywriting + color extraction)
```

## Testing

Test against real product listings across categories:

- **Handmade/Etsy-style:** ceramic mug, handmade soap, knit scarf
- **Apparel:** t-shirt, leather wallet, sneakers
- **Electronics:** wireless earbuds, smart watch, phone charger

Verify that:
- Generated copy stays faithful to original claims (no invented specs)
- Color extraction produces sensible themes across different image types
- Scroll animations hold up on both desktop and mobile

## License

MIT
