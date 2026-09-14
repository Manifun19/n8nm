'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, supabaseConfig } from '@/config/env';

/**
 * Browser Supabase client. Only ever receives the anon key — the service-role
 * key must never reach client code.
 *
 * Returns `null` when the deployment has no Supabase credentials so that the
 * UI can render an "unconfigured" state instead of throwing.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
