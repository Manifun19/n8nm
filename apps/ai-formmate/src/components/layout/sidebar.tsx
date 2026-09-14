'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP, ROUTES } from '@/config/app';
import { isNavItemActive, NAV_ITEMS } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils/cn';
import { NavIcon } from './nav-icon';

/** Persistent desktop navigation. Hidden below `lg`, where the bottom bar takes over. */
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-line bg-surface-raised lg:block">
      <div className="sticky top-0 flex h-dvh flex-col">
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-2 px-5 py-5 text-base font-semibold text-ink"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white"
          >
            AF
          </span>
          {APP.name}
        </Link>

        <nav aria-label={t('nav.primary')} className="flex-1 overflow-y-auto px-3 pb-6">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item, pathname);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-800'
                        : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                    )}
                  >
                    <NavIcon id={item.id} className="size-4.5 shrink-0" />
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
