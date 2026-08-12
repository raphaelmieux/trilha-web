import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // detectSessionInUrl + flowType 'implicit' put the session token in a URL hash
    // fragment (#access_token=...), which would collide with HashRouter's own
    // #/route-based routing. PKCE carries it in a ?code= query param instead, so
    // the two don't fight over window.location.hash. This app doesn't currently
    // use any redirect-based auth flow (OAuth, magic link), but this keeps the
    // client correct if one is added later.
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
