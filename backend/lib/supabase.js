import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL) throw new Error('SUPABASE_URL is required');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');

// Server-only client with service-role privileges. Never expose to the browser.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// Anon client for verifying user JWTs (getUser).
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || '', {
    auth: { autoRefreshToken: false, persistSession: false },
});
