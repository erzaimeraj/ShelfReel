export interface ThemePalette {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface Showcase {
  id: string;
  source_type: string;
  source_url: string | null;
  original_title: string;
  original_price: string | null;
  original_description: string | null;
  image_url: string | null;
  image_storage_path: string | null;
  generated_headline: string | null;
  generated_blurbs: string[] | null;
  theme: ThemePalette | null;
  created_at: string;
}
