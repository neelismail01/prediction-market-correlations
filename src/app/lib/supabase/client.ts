import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/app/types/supabase';

let supabaseClient: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env.local file. ' +
        'Make sure to restart your Next.js dev server after adding environment variables.'
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient<Database>];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
