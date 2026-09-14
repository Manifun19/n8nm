import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { PhasePlaceholder } from '@/components/ui/phase-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('nav.notifications') };
}

export default function NotificationsPage() {
  return <PhasePlaceholder titleKey="nav.notifications" phase="Phase 9 — Notification Analyzer" />;
}
