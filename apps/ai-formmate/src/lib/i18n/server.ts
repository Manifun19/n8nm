import 'server-only';
import { cookies } from 'next/headers';
import { getTranslator, type Translator } from './index';
import { LOCALE_COOKIE, resolveLocale, type Locale } from './locales';

/** Reads the visitor's locale preference from the cookie set by the switcher. */
export async function getCurrentLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getServerTranslator(): Promise<{ locale: Locale; t: Translator }> {
  const locale = await getCurrentLocale();
  return { locale, t: getTranslator(locale) };
}
