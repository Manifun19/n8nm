import { z } from 'zod';

/**
 * Environment access is centralised here so that no component or service
 * reads `process.env` directly.
 *
 * Design rule: a missing Supabase configuration must NOT crash the build or
 * the marketing pages. It degrades the app into "unconfigured" mode, where
 * authenticated areas explain what is missing instead of throwing.
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_FEATURE_FORM_ASSISTANT: z.enum(['true', 'false']).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time only when the
 * property is referenced statically, so each key is spelled out.
 */
function readPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_FEATURE_FORM_ASSISTANT: process.env.NEXT_PUBLIC_FEATURE_FORM_ASSISTANT,
  });

  return parsed.success ? parsed.data : {};
}

export const publicEnv = readPublicEnv();

export const supabaseConfig = {
  url: publicEnv.NEXT_PUBLIC_SUPABASE_URL ?? '',
  anonKey: publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;

/** True when the app has enough configuration to talk to Supabase. */
export function isSupabaseConfigured(): boolean {
  return supabaseConfig.url.length > 0 && supabaseConfig.anonKey.length > 0;
}

export const featureFlags = {
  formAssistant: publicEnv.NEXT_PUBLIC_FEATURE_FORM_ASSISTANT === 'true',
} as const;

export function getSiteUrl(): string {
  return (
    publicEnv.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  );
}

/**
 * Server-only secrets. Importing this from client code would leak keys, so it
 * throws loudly if it is ever evaluated in the browser.
 */
export function getServerSecrets() {
  if (typeof window !== 'undefined') {
    throw new Error('Server secrets must never be read in the browser.');
  }

  return {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    documentsBucket: process.env.SUPABASE_DOCUMENTS_BUCKET ?? 'documents',
    ai: {
      provider: process.env.AI_PROVIDER ?? 'none',
      apiKey: process.env.AI_API_KEY ?? '',
      baseUrl: process.env.AI_BASE_URL ?? '',
      model: process.env.AI_MODEL ?? '',
    },
  } as const;
}
