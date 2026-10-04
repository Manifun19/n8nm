import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { PhasePlaceholder } from '@/components/ui/phase-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('nav.screenshots') };
}

export default function ScreenshotsPage() {
  return <PhasePlaceholder titleKey="nav.screenshots" phase="Phase 7 — Screenshot Manager" />;
}
