import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, supabaseConfig } from '@/config/env';
import { isProtectedPath, ROUTES } from '@/config/app';

function redirectToSignIn(request: NextRequest, pathname: string, search: string): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = ROUTES.signIn;
  redirectUrl.search = '';
  redirectUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(redirectUrl);
}

/**
 * Refreshes the Supabase session on every request and guards protected routes.
 *
 * Never trust a client-side check alone: this runs before the route renders,
 * and each page additionally re-reads the user server-side.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { pathname, search } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    // Without credentials nobody can be signed in, so protected routes must
    // still be turned away rather than rendering an empty authenticated shell.
    return isProtectedPath(pathname) ? redirectToSignIn(request, pathname, search) : response;
  }

  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(pathname)) {
    return redirectToSignIn(request, pathname, search);
  }

  if (user && (pathname === ROUTES.signIn || pathname === ROUTES.signUp)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ROUTES.dashboard;
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
