import { describe, expect, it } from 'vitest';
import { en } from './dictionaries/en';
import { hi } from './dictionaries/hi';
import { getTranslator, resolveLocale, isLocale, LOCALES } from './index';

describe('i18n catalogue', () => {
  it('exposes exactly the supported locales', () => {
    expect(LOCALES).toEqual(['en', 'hi']);
  });

  it('has a Hindi translation for every English key', () => {
    const missing = Object.keys(en).filter((key) => !(key in hi));
    expect(missing).toEqual([]);
  });

  it('has no Hindi keys that are absent from English', () => {
    const extra = Object.keys(hi).filter((key) => !(key in en));
    expect(extra).toEqual([]);
  });

  it('never leaves a translation empty', () => {
    const empty = Object.entries(hi).filter(([, value]) => value.trim().length === 0);
    expect(empty).toEqual([]);
  });
});

describe('getTranslator', () => {
  it('returns locale specific copy', () => {
    expect(getTranslator('en')('nav.dashboard')).toBe('Dashboard');
    expect(getTranslator('hi')('nav.dashboard')).toBe('डैशबोर्ड');
  });

  it('falls back to the key when it is unknown', () => {
    const t = getTranslator('en');
    // @ts-expect-error — intentionally passing an unknown key.
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('interpolates named values', () => {
    const t = getTranslator('en');
    // @ts-expect-error — ad-hoc key used to exercise interpolation only.
    expect(t('{name} has {count} items', { name: 'Vault', count: 3 })).toBe('Vault has 3 items');
  });
});

describe('resolveLocale', () => {
  it.each([
    ['en', 'en'],
    ['hi', 'hi'],
    ['fr', 'en'],
    [undefined, 'en'],
    [null, 'en'],
    [42, 'en'],
  ])('resolves %s to %s', (input, expected) => {
    expect(resolveLocale(input)).toBe(expected);
  });

  it('narrows with isLocale', () => {
    expect(isLocale('hi')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });
});
