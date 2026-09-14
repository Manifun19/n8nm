import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/config/app';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { DashboardView } from '@/features/dashboard/dashboard-view';
import { getSessionUser } from '@/services/auth.service';
import { getDashboardData } from '@/services/dashboard.service';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('dashboard.title') };
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.signIn);

  const data = await getDashboardData(user.id);

  return (
    <DashboardView
      displayName={data.profile.fullName ?? user.displayName}
      profile={data.profile}
      counts={data.counts}
      applications={data.applications}
      upcoming={data.upcoming}
    />
  );
}
