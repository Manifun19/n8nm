import Link from 'next/link';
import { APP, ROUTES } from '@/config/app';
import { getServerTranslator } from '@/lib/i18n/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getServerTranslator();

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="mx-auto w-full max-w-6xl px-4 py-5 lg:px-8">
        <Link href={ROUTES.home} className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white"
          >
            AF
          </span>
          <span className="text-base font-semibold text-ink">{APP.name}</span>
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-start justify-center px-4 pb-12 lg:items-center">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-ink-muted">{t('app.tagline')}</footer>
    </div>
  );
}
