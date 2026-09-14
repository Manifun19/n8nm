import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { PhasePlaceholder } from '@/components/ui/phase-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('nav.applications') };
}

export default function ApplicationsPage() {
  return <PhasePlaceholder titleKey="nav.applications" phase="Phase 11 — Application Preparation / Phase 13 — Application Tracker" />;
}
