import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
    // Don't throw — the marketing site should render without Supabase.
    console.warn('Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Auth features disabled.');
}

export const supabase = createClient(url || 'http://placeholder', anon || 'placeholder', {
    auth: { persistSession: true, autoRefreshToken: true },
});
