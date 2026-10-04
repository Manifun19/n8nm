import type { TranslationKey } from '@/lib/i18n';
import { ROUTES } from './app';

export type NavIcon =
  | 'dashboard'
  | 'applications'
  | 'exams'
  | 'profile'
  | 'documents'
  | 'photoSignature'
  | 'pdfTools'
  | 'screenshots'
  | 'notifications'
  | 'settings'
  | 'help';

export interface NavItem {
  id: NavIcon;
  href: string;
  labelKey: TranslationKey;
  /** Shown in the compact mobile bottom bar. */
  primary: boolean;
}

/** Single source of truth for the main navigation (spec §6). */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'dashboard', href: ROUTES.dashboard, labelKey: 'nav.dashboard', primary: true },
  { id: 'applications', href: ROUTES.applications, labelKey: 'nav.applications', primary: true },
  { id: 'exams', href: ROUTES.exams, labelKey: 'nav.exams', primary: false },
  { id: 'profile', href: ROUTES.profile, labelKey: 'nav.profile', primary: true },
  { id: 'documents', href: ROUTES.documents, labelKey: 'nav.documents', primary: true },
  {
    id: 'photoSignature',
    href: ROUTES.photoSignature,
    labelKey: 'nav.photoSignature',
    primary: false,
  },
  { id: 'pdfTools', href: ROUTES.pdfTools, labelKey: 'nav.pdfTools', primary: false },
  { id: 'screenshots', href: ROUTES.screenshots, labelKey: 'nav.screenshots', primary: false },
  {
    id: 'notifications',
    href: ROUTES.notifications,
    labelKey: 'nav.notifications',
    primary: false,
  },
  { id: 'settings', href: ROUTES.settings, labelKey: 'nav.settings', primary: false },
  { id: 'help', href: ROUTES.help, labelKey: 'nav.help', primary: false },
] as const;

/** Items rendered in the mobile bottom bar, plus a "more" entry in the UI. */
export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.primary);

/**
 * Marks the active navigation entry. The dashboard must match exactly,
 * otherwise every route would look active under a prefix match.
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.href === ROUTES.dashboard) {
    return pathname === ROUTES.dashboard;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
