'use client';

import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n/provider';
import { Card, CardBody } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

/**
 * Honest placeholder for modules scheduled in later development phases.
 * It never pretends the feature works.
 */
export function PhasePlaceholder({ titleKey, phase }: { titleKey: TranslationKey; phase: string }) {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={t(titleKey)} description={t('common.comingSoonBody')} />
      <Card>
        <CardBody className="space-y-2">
          <p className="text-sm font-medium text-ink">{t('common.comingSoon')}</p>
          <p className="text-sm text-ink-muted">{phase}</p>
        </CardBody>
      </Card>
    </>
  );
}
