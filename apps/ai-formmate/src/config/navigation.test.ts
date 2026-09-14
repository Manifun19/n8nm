import { describe, expect, it } from 'vitest';
import { en } from '@/lib/i18n/dictionaries/en';
import { isProtectedPath, ROUTES } from './app';
import { isNavItemActive, NAV_ITEMS, PRIMARY_NAV_ITEMS } from './navigation';

describe('navigation config', () => {
  it('covers every entry required by the product spec', () => {
    expect(NAV_ITEMS.map((item) => item.id)).toEqual([
      'dashboard',
      'applications',
      'exams',
      'profile',
      'documents',
      'photoSignature',
      'pdfTools',
      'screenshots',
      'notifications',
      'settings',
      'help',
    ]);
  });

  it('uses only translation keys that exist', () => {
    for (const item of NAV_ITEMS) {
      expect(en).toHaveProperty(item.labelKey);
    }
  });

  it('keeps the mobile bottom bar small enough to stay tappable', () => {
    expect(PRIMARY_NAV_ITEMS.length).toBeLessThanOrEqual(4);
  });

  it('has unique hrefs', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('isNavItemActive', () => {
  const dashboard = NAV_ITEMS[0]!;
  const applications = NAV_ITEMS[1]!;

  it('matches the dashboard exactly', () => {
    expect(isNavItemActive(dashboard, '/dashboard')).toBe(true);
    expect(isNavItemActive(dashboard, '/dashboard/anything')).toBe(false);
  });

  it('matches nested routes for other sections', () => {
    expect(isNavItemActive(applications, '/applications')).toBe(true);
    expect(isNavItemActive(applications, '/applications/abc-123')).toBe(true);
    expect(isNavItemActive(applications, '/exams')).toBe(false);
  });
});

describe('isProtectedPath', () => {
  it.each([ROUTES.dashboard, ROUTES.documents, '/applications/xyz', '/profile/education'])(
    'protects %s',
    (path) => {
      expect(isProtectedPath(path)).toBe(true);
    },
  );

  it.each([ROUTES.home, ROUTES.signIn, ROUTES.signUp, ROUTES.help, '/applications-public'])(
    'leaves %s public',
    (path) => {
      expect(isProtectedPath(path)).toBe(false);
    },
  );
});
