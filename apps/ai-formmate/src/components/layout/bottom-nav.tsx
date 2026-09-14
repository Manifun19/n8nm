'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { isNavItemActive, PRIMARY_NAV_ITEMS } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils/cn';
import { NavIcon } from './nav-icon';

/**
 * Mobile bottom navigation. Four primary destinations plus a "more" trigger,
 * each a full-height tap target so the app does not feel like a shrunken
 * desktop site.
 */
export function BottomNav({ onOpenMore }: { onOpenMore: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('nav.primary')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item, pathname);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium',
                  active ? 'text-brand-700' : 'text-ink-muted',
                )}
              >
                <NavIcon id={item.id} className="size-5" />
                <span className="line-clamp-1">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onOpenMore}
            className="flex h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-ink-muted"
          >
            <Menu aria-hidden className="size-5" />
            {t('common.menu')}
          </button>
        </li>
      </ul>
    </nav>
  );
}
