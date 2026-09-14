import { NextResponse, type NextRequest } from 'next/server';
import { ROUTES } from '@/config/app';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logError } from '@/lib/utils/errors';

/** Sign-out is POST-only so it cannot be triggered by a cross-site GET. */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) logError('auth.signOut', error);
  }

  return NextResponse.redirect(`${request.nextUrl.origin}${ROUTES.home}`, { status: 303 });
}
