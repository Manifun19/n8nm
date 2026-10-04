import { NextResponse, type NextRequest } from 'next/server';
import { ROUTES } from '@/config/app';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logError } from '@/lib/utils/errors';

/**
 * Exchanges the email-confirmation / magic-link code for a session.
 *
 * The `next` parameter is validated to be a same-origin relative path so this
 * endpoint can never be used as an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next');
  const next =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : ROUTES.dashboard;

  if (!code) {
    return NextResponse.redirect(`${origin}${ROUTES.signIn}`);
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}${ROUTES.signIn}`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    logError('auth.callback', error);
    return NextResponse.redirect(`${origin}${ROUTES.signIn}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
