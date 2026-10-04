import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { PhasePlaceholder } from '@/components/ui/phase-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('nav.photoSignature') };
}

export default function PhotoSignaturePage() {
  return <PhasePlaceholder titleKey="nav.photoSignature" phase="Phase 4 — Photo Assistant / Phase 5 — Signature Assistant" />;
}
