/** Static product identity. Display copy lives in the translation catalogue. */
export const APP = {
  name: 'AI FormMate',
  taglineKey: 'app.tagline',
  positioningKey: 'app.positioning',
  supportEmail: 'support@example.com',
} as const;

/** Route constants — never hard-code a path string inside a component. */
export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  authCallback: '/auth/callback',
  signOut: '/auth/sign-out',
  dashboard: '/dashboard',
  applications: '/applications',
  exams: '/exams',
  profile: '/profile',
  documents: '/documents',
  photoSignature: '/photo-signature',
  pdfTools: '/pdf-tools',
  screenshots: '/screenshots',
  notifications: '/notifications',
  settings: '/settings',
  help: '/help',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Routes that require an authenticated session. */
export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.applications,
  ROUTES.exams,
  ROUTES.profile,
  ROUTES.documents,
  ROUTES.photoSignature,
  ROUTES.pdfTools,
  ROUTES.screenshots,
  ROUTES.notifications,
  ROUTES.settings,
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
