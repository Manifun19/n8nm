'use client';

import Link from 'next/link';
import {
  Camera, FilePlus2, FileText, PenLine, ScanLine, Upload,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/config/app';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n/provider';
import { Badge, STATUS_TONES } from '@/components/ui/badge';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ButtonLink } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import type {
  ApplicationCard,
  ApplicationSummaryCounts,
  CandidateProfileSummary,
  UpcomingItem,
} from '@/types/domain';
import { daysUntil, profileCompletionPercent, sortUpcoming } from './summary';

const QUICK_ACTIONS: { icon: LucideIcon; labelKey: TranslationKey; href: string }[] = [
  { icon: FilePlus2, labelKey: 'dashboard.action.newApplication', href: ROUTES.applications },
  { icon: Upload, labelKey: 'dashboard.action.uploadDocument', href: ROUTES.documents },
  { icon: Camera, labelKey: 'dashboard.action.preparePhoto', href: ROUTES.photoSignature },
  { icon: PenLine, labelKey: 'dashboard.action.prepareSignature', href: ROUTES.photoSignature },
  { icon: ScanLine, labelKey: 'dashboard.action.scanDocument', href: ROUTES.documents },
  { icon: FileText, labelKey: 'dashboard.action.createPdf', href: ROUTES.pdfTools },
];

const SUMMARY_TILES: { key: keyof ApplicationSummaryCounts; labelKey: TranslationKey }[] = [
  { key: 'draft', labelKey: 'status.draft' },
  { key: 'in_progress', labelKey: 'status.in_progress' },
  { key: 'submitted', labelKey: 'status.submitted' },
  { key: 'payment_pending', labelKey: 'status.payment_pending' },
  { key: 'completed', labelKey: 'status.completed' },
];

const UPCOMING_LABELS: Record<UpcomingItem['kind'], TranslationKey> = {
  deadline: 'upcoming.deadline',
  exam_date: 'upcoming.examDate',
  admit_card: 'upcoming.admitCard',
  update: 'upcoming.update',
};

export interface DashboardViewProps {
  displayName: string | null;
  profile: CandidateProfileSummary;
  counts: ApplicationSummaryCounts;
  applications: ApplicationCard[];
  upcoming: UpcomingItem[];
}

export function DashboardView({
  displayName,
  profile,
  counts,
  applications,
  upcoming,
}: DashboardViewProps) {
  const { t, locale } = useTranslation();
  const completion = profileCompletionPercent(profile);
  const upcomingItems = sortUpcoming(upcoming);
  const dateFormatter = new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  function formatDate(value: string | null): string {
    if (!value) return t('common.notAvailable');
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? t('common.notAvailable') : dateFormatter.format(parsed);
  }

  return (
    <>
      <PageHeader
        title={`${t(displayName ? 'dashboard.greeting' : 'dashboard.greetingAnonymous')}${
          displayName ? `, ${displayName}` : ''
        }`}
        description={t('dashboard.subtitle')}
      />

      {completion < 100 ? (
        <Card>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {t('dashboard.profileCompletion')} — {completion}%
              </p>
              <p className="mt-1 text-sm text-ink-muted">{t('dashboard.profileCompletionBody')}</p>
              <div
                role="progressbar"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('dashboard.profileCompletion')}
                className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
              >
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <ButtonLink href={ROUTES.profile} variant="secondary" className="shrink-0">
              {t('dashboard.completeProfile')}
            </ButtonLink>
          </CardBody>
        </Card>
      ) : null}

      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="mb-3 text-sm font-semibold text-ink">
          {t('dashboard.quickActions')}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map(({ icon: Icon, labelKey, href }) => (
            <li key={labelKey}>
              <Link
                href={href}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-(--radius-card) border border-line bg-surface-raised p-3 text-center text-xs font-medium text-ink transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                <Icon aria-hidden className="size-5 text-brand-600" />
                {t(labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section aria-labelledby="summary-heading" className="lg:col-span-2">
          <Card>
            <CardHeader title={t('dashboard.summary')} />
            <CardBody>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {SUMMARY_TILES.map(({ key, labelKey }) => (
                  <div key={key} className="rounded-lg bg-surface-sunken px-3 py-3">
                    <dt className="text-xs font-medium text-ink-muted">{t(labelKey)}</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink">
                      {counts[key]}
                    </dd>
                  </div>
                ))}
              </dl>
              <h2 id="summary-heading" className="sr-only">
                {t('dashboard.summary')}
              </h2>
            </CardBody>
          </Card>
        </section>

        <section aria-labelledby="upcoming-heading">
          <Card className="h-full">
            <CardHeader title={t('dashboard.upcoming')} />
            <CardBody className="p-0">
              <h2 id="upcoming-heading" className="sr-only">
                {t('dashboard.upcoming')}
              </h2>
              {upcomingItems.length === 0 ? (
                <EmptyState title={t('dashboard.upcomingEmpty')} />
              ) : (
                <ul className="divide-y divide-line">
                  {upcomingItems.map((item) => {
                    const days = daysUntil(item.date);
                    return (
                      <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                          <p className="text-xs text-ink-muted">{t(UPCOMING_LABELS[item.kind])}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs text-ink-muted">{formatDate(item.date)}</p>
                          <Badge tone={days <= 3 ? 'danger' : days <= 10 ? 'warning' : 'neutral'}>
                            {days}d
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>
      </div>

      <section aria-labelledby="recent-heading">
        <Card>
          <CardHeader
            title={t('dashboard.recent')}
            action={
              applications.length > 0 ? (
                <Link
                  href={ROUTES.applications}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  {t('common.viewAll')}
                </Link>
              ) : undefined
            }
          />
          <CardBody className="p-0">
            <h2 id="recent-heading" className="sr-only">
              {t('dashboard.recent')}
            </h2>
            {applications.length === 0 ? (
              <EmptyState
                title={t('dashboard.recentEmpty')}
                body={t('dashboard.recentEmptyBody')}
                action={
                  <ButtonLink href={ROUTES.profile} variant="secondary" size="sm">
                    {t('dashboard.completeProfile')}
                  </ButtonLink>
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {applications.slice(0, 5).map((application) => (
                  <li key={application.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {application.examName}
                        </p>
                        {application.post ? (
                          <p className="truncate text-xs text-ink-muted">
                            {t('application.post')}: {application.post}
                          </p>
                        ) : null}
                      </div>
                      <Badge tone={STATUS_TONES[application.status]}>
                        {t(`status.${application.status}`)}
                      </Badge>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-muted sm:grid-cols-4">
                      <div>
                        <dt className="font-medium">{t('application.number')}</dt>
                        <dd>{application.applicationNumber ?? t('common.notAvailable')}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">{t('application.date')}</dt>
                        <dd>{formatDate(application.applicationDate)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">{t('application.deadline')}</dt>
                        <dd>{formatDate(application.deadline)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">{t('application.documents')}</dt>
                        <dd className="tabular-nums">{application.documentCount}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>
    </>
  );
}
