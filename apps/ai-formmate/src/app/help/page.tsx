import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/config/app';
import { getServerTranslator, getCurrentLocale } from '@/lib/i18n/server';
import { getTranslator, type TranslationKey } from '@/lib/i18n';
import { Alert } from '@/components/ui/alert';
import { Card, CardBody } from '@/components/ui/card';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('help.title') };
}

const SAFETY_KEYS: TranslationKey[] = [
  'safety.otpRequired',
  'safety.captchaRequired',
  'safety.neverSubmitSilently',
  'trust.eligibilityNotice',
];

/** Public help page — reachable without an account. */
export default async function HelpPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('help.title')}</h1>
      <p className="mt-2 text-sm text-ink-muted">{t('help.body')}</p>

      <Card className="mt-6">
        <CardBody>
          <ul className="space-y-2 text-sm text-ink-muted">
            {SAFETY_KEYS.map((key) => (
              <li key={key}>• {t(key)}</li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Alert tone="info" className="mt-6">
        {t('trust.verifyNotice')}
      </Alert>

      <Link
        href={ROUTES.home}
        className="mt-6 inline-block text-sm font-medium text-brand-700 hover:underline"
      >
        {t('error.backToHome')}
      </Link>
    </div>
  );
}
