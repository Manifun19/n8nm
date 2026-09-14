import { en, type TranslationKey } from './dictionaries/en';
import { hi } from './dictionaries/hi';
import { DEFAULT_LOCALE, type Locale } from './locales';

export type { TranslationKey };
export type { Locale };
export { LOCALES, LOCALE_LABELS, LOCALE_COOKIE, DEFAULT_LOCALE, isLocale, resolveLocale } from './locales';

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  hi,
};

export type TranslateValues = Record<string, string | number>;

/** A translate function bound to one locale. */
export type Translator = (key: TranslationKey, values?: TranslateValues) => string;

function interpolate(template: string, values?: TranslateValues): string {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

export function getDictionary(locale: Locale): Record<TranslationKey, string> {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/**
 * Builds a translator. Unknown keys fall back to the default locale and then
 * to the key itself, so a missing translation degrades instead of crashing.
 */
export function getTranslator(locale: Locale): Translator {
  const dictionary = getDictionary(locale);
  const fallback = dictionaries[DEFAULT_LOCALE];

  return (key, values) => interpolate(dictionary[key] ?? fallback[key] ?? key, values);
}
