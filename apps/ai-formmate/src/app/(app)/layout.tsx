import { redirect } from 'next/navigation';
import { ROUTES } from '@/config/app';
import { isSupabaseConfigured } from '@/config/env';
import { AppShell } from '@/components/layout/app-shell';
import { getSessionUser } from '@/services/auth.service';

/**
 * Server-side guard for every authenticated route.
 *
 * The middleware already redirects unauthenticated visitors; this second check
 * means a page can never render user data if the middleware is bypassed.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    redirect(ROUTES.signIn);
  }

  const user = await getSessionUser();
  if (!user) {
    redirect(ROUTES.signIn);
  }

  return <AppShell email={user.email}>{children}</AppShell>;
}
