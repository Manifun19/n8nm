'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { isNavItemActive, NAV_ITEMS } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n/provider';
import { cn } from '@/lib/utils/cn';
import { NavIcon } from './nav-icon';

/** Full navigation drawer for small screens, opened from the bottom bar. */
export function MobileNavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label={t('common.closeMenu')}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.primary')}
        className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-surface-raised p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">{t('common.menu')}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('common.closeMenu')}
            className="grid size-10 place-items-center rounded-lg text-ink-muted hover:bg-surface-sunken"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium',
                    active
                      ? 'border-brand-200 bg-brand-50 text-brand-800'
                      : 'border-line text-ink hover:bg-surface-sunken',
                  )}
                >
                  <NavIcon id={item.id} className="size-5 shrink-0" />
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
