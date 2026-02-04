import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client used by API routes in this app.
 *
 * Env vars supported (in order of preference):
 * - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (recommended for server routes)
 *   or SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseEnvOk = Boolean(supabaseUrl && supabaseKey);
