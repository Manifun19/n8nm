import Link from 'next/link';
import { ShieldCheck, FileCheck2, FolderLock, Camera, UserRound } from 'lucide-react';
import { APP, ROUTES } from '@/config/app';
import { getServerTranslator } from '@/lib/i18n/server';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import type { TranslationKey } from '@/lib/i18n';

const FEATURES: { icon: typeof UserRound; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  {
    icon: UserRound,
    titleKey: 'landing.feature.profileTitle',
    bodyKey: 'landing.feature.profileBody',
  },
  { icon: FolderLock, titleKey: 'landing.feature.vaultTitle', bodyKey: 'landing.feature.vaultBody' },
  { icon: Camera, titleKey: 'landing.feature.mediaTitle', bodyKey: 'landing.feature.mediaBody' },
  {
    icon: FileCheck2,
    titleKey: 'landing.feature.checksTitle',
    bodyKey: 'landing.feature.checksBody',
  },
];

const SAFETY_KEYS: TranslationKey[] = [
  'landing.safety.captcha',
  'landing.safety.payment',
  'landing.safety.submit',
  'landing.safety.identity',
];

export default async function LandingPage() {
  const { t } = await getServerTranslator();

  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white"
          >
            AF
          </span>
          <span className="text-base font-semibold text-ink">{APP.name}</span>
        </div>
        <nav aria-label={t('nav.primary')} className="flex items-center gap-2">
          <Link
            href={ROUTES.signIn}
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          >
            {t('landing.ctaSecondary')}
          </Link>
          <ButtonLink href={ROUTES.signUp} size="sm">
            {t('auth.signUp')}
          </ButtonLink>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 pb-16 lg:px-8">
        <section className="py-10 lg:py-16">
          <p className="text-sm font-medium text-brand-700">{t('app.positioning')}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            {t('landing.heroBody')}
          </p>
          <p lang="hi" className="mt-3 max-w-2xl text-base text-ink-muted">
            {t('landing.hindiPositioning')}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={ROUTES.signUp} size="lg">
              {t('landing.ctaPrimary')}
            </ButtonLink>
            <ButtonLink href={ROUTES.signIn} size="lg" variant="secondary">
              {t('landing.ctaSecondary')}
            </ButtonLink>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="grid gap-4 sm:grid-cols-2">
          <h2 id="features-heading" className="sr-only">
            {t('app.subPositioning')}
          </h2>
          {FEATURES.map(({ icon: Icon, titleKey, bodyKey }) => (
            <Card key={titleKey}>
              <CardBody className="space-y-2">
                <Icon aria-hidden className="size-5 text-brand-600" />
                <h3 className="text-base font-semibold text-ink">{t(titleKey)}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{t(bodyKey)}</p>
              </CardBody>
            </Card>
          ))}
        </section>

        <section aria-labelledby="safety-heading" className="mt-10">
          <Card>
            <CardBody className="space-y-3">
              <h2
                id="safety-heading"
                className="flex items-center gap-2 text-base font-semibold text-ink"
              >
                <ShieldCheck aria-hidden className="size-5 text-emerald-600" />
                {t('landing.safetyTitle')}
              </h2>
              <ul className="space-y-2 text-sm text-ink-muted">
                {SAFETY_KEYS.map((key) => (
                  <li key={key} className="flex gap-2">
                    <span aria-hidden className="text-emerald-600">
                      ✓
                    </span>
                    {t(key)}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </section>

        <section className="mt-8">
          <Alert tone="info">{t('landing.disclaimer')}</Alert>
        </section>
      </main>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-ink-muted lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>
            {APP.name} — {t('app.subPositioning')}
          </p>
          <Link href={ROUTES.help} className="hover:text-ink">
            {t('nav.help')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
