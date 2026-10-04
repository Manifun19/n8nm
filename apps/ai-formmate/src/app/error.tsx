'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/utils/errors';

/**
 * Route-level error boundary. The user only sees translated, non-technical
 * copy; the detail goes to the developer log channel.
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    logError('route', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">{t('error.title')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('error.body')}</p>
      <Button onClick={reset} className="mt-6">
        {t('common.retry')}
      </Button>
    </div>
  );
}
