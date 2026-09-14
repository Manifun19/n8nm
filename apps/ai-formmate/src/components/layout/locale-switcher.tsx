'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import { LOCALE_COOKIE, LOCALES, LOCALE_LABELS, resolveLocale } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n/provider';

/**
 * Persists the locale in a cookie the server layout reads, so the whole tree
 * (including server components) re-renders in the chosen language.
 */
export function LocaleSwitcher() {
  const { locale, t } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(value: string) {
    const next = resolveLocale(value);
    // One year, same-site; contains no personal data.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      <Languages aria-hidden className="size-4 text-ink-muted" />
      <label htmlFor="locale-switcher" className="sr-only">
        {t('common.language')}
      </label>
      <select
        id="locale-switcher"
        value={locale}
        disabled={pending}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-line bg-surface-raised px-2 text-sm text-ink"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value}>
            {LOCALE_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
