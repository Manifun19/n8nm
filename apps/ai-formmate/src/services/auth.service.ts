import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logError } from '@/lib/utils/errors';

export interface SessionUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Reads the authenticated user from the server.
 *
 * Always uses `getUser()` (which validates the JWT with Supabase) rather than
 * `getSession()`, whose cookie payload can be spoofed.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const metadataName = user.user_metadata?.['full_name'];

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: typeof metadataName === 'string' && metadataName ? metadataName : null,
    };
  } catch (error) {
    logError('auth.getSessionUser', error);
    return null;
  }
}
