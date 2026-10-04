import Link from 'next/link';
import { ROUTES } from '@/config/app';
import { getServerTranslator } from '@/lib/i18n/server';

export default async function NotFound() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">{t('error.notFoundTitle')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('error.notFoundBody')}</p>
      <Link href={ROUTES.home} className="mt-6 text-sm font-medium text-brand-700 hover:underline">
        {t('error.backToHome')}
      </Link>
    </div>
  );
}
