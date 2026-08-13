import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL);
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getImageUrl(imageFilename: string) {
  if (isSupabaseConfigured) {
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${imageFilename}`;
  }
  return `/${imageFilename}`;
}
