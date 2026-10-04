import type { Metadata, Viewport } from 'next';
import { APP } from '@/config/app';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${APP.name} — Government Exam Forms`,
    template: `%s · ${APP.name}`,
  },
  description:
    'AI-powered government application assistant. Save your profile and documents once, prepare every application accurately, and stay in control of OTP, CAPTCHA, payment and submission.',
  applicationName: APP.name,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4338ca',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();
  const t = getTranslator(locale);

  return (
    <html lang={locale} dir="ltr">
      <body className="min-h-dvh antialiased">
        <I18nProvider locale={locale}>{children}</I18nProvider>
        {/* Announces route-level status messages to assistive technology. */}
        <div aria-live="polite" className="sr-only" id="a11y-live-region">
          {t('common.loading')}
        </div>
      </body>
    </html>
  );
}
