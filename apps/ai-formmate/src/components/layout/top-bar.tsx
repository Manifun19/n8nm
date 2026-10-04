'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { APP, ROUTES } from '@/config/app';
import { useTranslation } from '@/lib/i18n/provider';
import { LocaleSwitcher } from './locale-switcher';

export function TopBar({ email }: { email: string | null }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface-raised/95 px-4 backdrop-blur lg:px-6">
      <Link href={ROUTES.dashboard} className="flex items-center gap-2 lg:hidden">
        <span
          aria-hidden
          className="grid size-7 place-items-center rounded-md bg-brand-600 text-xs font-bold text-white"
        >
          AF
        </span>
        <span className="text-sm font-semibold text-ink">{APP.name}</span>
      </Link>

      <div className="hidden text-sm text-ink-muted lg:block">{t('app.positioning')}</div>

      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        {email ? (
          <span className="hidden max-w-40 truncate text-sm text-ink-muted sm:inline">{email}</span>
        ) : null}
        {/* Sign-out is a POST so it cannot be triggered by a cross-site GET. */}
        <form action={ROUTES.signOut} method="post">
          <button
            type="submit"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <LogOut aria-hidden className="size-4" />
            <span className="hidden sm:inline">{t('nav.signOut')}</span>
          </button>
        </form>
      </div>
    </header>
  );
}
