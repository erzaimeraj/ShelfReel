import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  title: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  sourceType: string;
  sourceUrl?: string;
}

interface ThemePalette {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

interface GeneratedCopy {
  headline: string;
  blurbs: string[];
}

const SYSTEM_PROMPT_COPY = `You are a senior copywriter for premium DTC (direct-to-consumer) brands. Your job is to take a real product listing and write punchier, more cinematic marketing copy.

CRITICAL CONSTRAINT — never invent:
You must ONLY rephrase and elevate claims that are ALREADY present in the original product title and description. You must NEVER invent:
- New specifications (dimensions, materials, weight, capacity, battery life, etc.)
- Ingredients or nutritional claims
- Guarantees, warranties, or certifications
- Performance metrics or statistics
- Features that are not mentioned in the source material
- Prices, discounts, or offers not in the original

Your job is to make the EXISTING claims feel more vivid and emotionally resonant — not to add new factual claims. If the original description is sparse, your output should be proportionally restrained. Elegance over hype.

You will return:
1. A headline: one short, punchy line (max ~8 words) that captures the essence of the product. Do not use quotes, do not use exclamation marks.
2. 2-3 benefit-focused blurbs: each one sentence (max ~20 words), highlighting a real benefit implied by the original description. Each blurb should feel distinct — not variations of the same point.

Return ONLY valid JSON in this exact format, no markdown, no code fences:
{"headline":"...","blurbs":["...","...","..."]}`;

const SYSTEM_PROMPT_COLOR = `You are a color analyst. You will be given a product image. Analyze its dominant colors and mood, then return a cohesive color palette suitable for a premium product landing page.

Return ONLY valid JSON in this exact format, no markdown, no code fences:
{
  "primary": "#hex",
  "accent": "#hex",
  "background": "#hex",
  "surface": "#hex",
  "text": "#hex",
  "textMuted": "#hex"
}

Rules:
- "primary" is the main brand color — the dominant or most characteristic color in the product image.
- "accent" is a contrasting/complementary color for CTAs and highlights. It should stand out against the background.
- "background" should be a soft, muted tone derived from the image — never pure white or pure black. It should feel like a tinted canvas.
- "surface" is slightly lighter or darker than background, for cards/panels.
- "text" must have strong contrast against "background" (aim for WCAG AA). If the background is light, text should be dark, and vice versa.
- "textMuted" is a softer version of text for secondary copy — still readable against background.
- All values must be valid 6-digit hex codes (#RRGGBB).
- The palette should feel harmonious and intentional, not a literal average of all pixels.`;

async function callGeminiText(
  apiKey: string,
  title: string,
  price: string,
  description: string
): Promise<GeneratedCopy> {
  const userPrompt = `Original product listing:
Title: ${title}
Price: ${price || "not provided"}
Description: ${description || "not provided"}

Write the new copy. Remember: only rephrase and elevate claims ALREADY in this listing. Return only JSON.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT_COPY }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini copy call failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text content");

  const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.headline || !Array.isArray(parsed.blurbs)) {
    throw new Error("Gemini response missing headline or blurbs");
  }
  return {
    headline: String(parsed.headline),
    blurbs: parsed.blurbs.map((b: unknown) => String(b)).slice(0, 3),
  };
}

async function callGeminiColor(
  apiKey: string,
  imageUrl: string
): Promise<ThemePalette> {
  // Fetch the image and convert to base64 for inline_data
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to fetch image for color analysis (${imgRes.status})`);
  }
  const imgBuffer = await imgRes.arrayBuffer();
  const bytes = new Uint8Array(imgBuffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  const imgBase64 = btoa(binary);
  const contentType = imgRes.headers.get("content-type") || "image/jpeg";

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT_COLOR }] },
            contents: [
              {
                role: "user",
                parts: [
                  { text: "Analyze this product image and return the color palette as JSON." },
                  { inline_data: { mime_type: contentType, data: imgBase64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 503 && attempt < 2) {
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          lastErr = new Error(`Gemini color call failed (${res.status}): ${errText}`);
          continue;
        }
        throw new Error(`Gemini color call failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini returned no color content");

      const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const required = ["primary", "accent", "background", "surface", "text", "textMuted"];
      for (const key of required) {
        if (!parsed[key] || !/^#[0-9a-fA-F]{6}$/.test(parsed[key])) {
          throw new Error(`Gemini color response missing or invalid: ${key}`);
        }
      }
      return parsed as ThemePalette;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
    }
  }
  throw lastErr || new Error("Color extraction failed after retries");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let apiKey = Deno.env.get("GEMINI_API_KEY");

    // Fallback: read from Supabase vault via RPC if env var not set
    if (!apiKey) {
      const vaultClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: keyData, error: keyError } = await vaultClient.rpc("get_gemini_api_key");
      if (keyError || !keyData) {
        return new Response(
          JSON.stringify({ error: "GEMINI_API_KEY is not configured. Set it as an edge function secret or in the vault." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      apiKey = keyData as string;
    }

    const body: GenerateRequest = await req.json();
    const { title, price, description, imageUrl, sourceType, sourceUrl } = body;

    if (!title || title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Product title is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run copywriting and color extraction in parallel
    const copyPromise = callGeminiText(apiKey, title, price || "", description || "");
    const colorPromise = imageUrl
      ? callGeminiColor(apiKey, imageUrl).catch(() => null)
      : Promise.resolve(null);

    const [copyResult, themeResult] = await Promise.all([copyPromise, colorPromise]);

    // Save to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: inserted, error: dbError } = await supabase
      .from("showcases")
      .insert({
        source_type: sourceType || "manual",
        source_url: sourceUrl || null,
        original_title: title,
        original_price: price || null,
        original_description: description || null,
        image_url: imageUrl || null,
        generated_headline: copyResult.headline,
        generated_blurbs: copyResult.blurbs,
        theme: themeResult,
      })
      .select("id")
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({
        id: inserted.id,
        headline: copyResult.headline,
        blurbs: copyResult.blurbs,
        theme: themeResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }  catch (err) {
  return new Response(
    JSON.stringify({
      error: err instanceof Error ? err.message : "Unknown error",
    }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
