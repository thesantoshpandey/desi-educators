import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // We don't throw here to avoid crashing the build if envs are missing during CI or initial setup
    console.warn('Missing Supabase environment variables');
}

// In production, use the proxy to bypass India's Supabase block
// The proxy is configured in next.config.ts rewrites
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const clientUrl = (isProduction && typeof window !== 'undefined')
    ? `${window.location.origin}/sb-proxy`
    : (supabaseUrl || 'https://placeholder.supabase.co');

export const supabase = createBrowserClient(
    clientUrl,
    supabaseAnonKey || 'placeholder-key'
);
