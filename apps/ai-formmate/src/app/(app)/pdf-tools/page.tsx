import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { PhasePlaceholder } from '@/components/ui/phase-placeholder';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('nav.pdfTools') };
}

export default function PdfToolsPage() {
  return <PhasePlaceholder titleKey="nav.pdfTools" phase="Phase 6 — PDF Tools" />;
}
