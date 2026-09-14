import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n/provider';
import type { ApplicationCard, UpcomingItem } from '@/types/domain';
import type { Locale } from '@/lib/i18n';
import { DashboardView } from './dashboard-view';
import { EMPTY_PROFILE_SUMMARY, summariseApplications } from './summary';

const applications: ApplicationCard[] = [
  {
    id: 'app-1',
    examName: 'SSC CGL 2026',
    organization: 'Staff Selection Commission',
    post: 'Assistant Section Officer',
    applicationNumber: 'SSC-99001',
    status: 'submitted',
    applicationDate: '2026-02-01',
    deadline: '2026-04-30',
    documentCount: 4,
    hasPdf: true,
    screenshotCount: 2,
  },
  {
    id: 'app-2',
    examName: 'UP Police 2026',
    organization: 'UPPRPB',
    post: null,
    applicationNumber: null,
    status: 'payment_pending',
    applicationDate: null,
    deadline: null,
    documentCount: 0,
    hasPdf: false,
    screenshotCount: 0,
  },
];

const upcoming: UpcomingItem[] = [
  {
    id: 'u1',
    kind: 'deadline',
    title: 'SSC CGL 2026',
    // Far enough in the future to stay "upcoming" regardless of the run date.
    date: '2099-01-01',
    applicationId: 'app-1',
  },
];

function renderDashboard(locale: Locale = 'en', overrides: Partial<Parameters<typeof DashboardView>[0]> = {}) {
  return render(
    <I18nProvider locale={locale}>
      <DashboardView
        displayName="Asha Devi"
        profile={EMPTY_PROFILE_SUMMARY}
        counts={summariseApplications(applications)}
        applications={applications}
        upcoming={upcoming}
        {...overrides}
      />
    </I18nProvider>,
  );
}

describe('DashboardView', () => {
  it('greets the candidate by name', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome back, Asha Devi');
  });

  it('renders every quick action from the spec', () => {
    renderDashboard();
    const quickActions = screen.getByRole('heading', { name: 'Quick actions' }).parentElement!;
    expect(within(quickActions).getAllByRole('link')).toHaveLength(6);
  });

  it('shows the application summary counts', () => {
    renderDashboard();
    const submitted = screen.getByText('Submitted', { selector: 'dt' }).parentElement!;
    expect(submitted).toHaveTextContent('1');
  });

  it('lists recent applications with their status', () => {
    renderDashboard();
    // Appears in both the upcoming list and the recent applications list.
    expect(screen.getAllByText('SSC CGL 2026').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('UP Police 2026')).toBeDefined();
    // 'Payment pending' is both a summary tile label and this card's status badge.
    expect(screen.getByText('Payment pending', { selector: 'span' })).toBeDefined();
  });

  it('falls back to a placeholder for missing application fields', () => {
    renderDashboard();
    // UP Police has no application number, date or deadline.
    expect(screen.getAllByText('Not available').length).toBeGreaterThanOrEqual(3);
  });

  it('prompts to complete an empty profile with an accessible progress bar', () => {
    renderDashboard();
    const progress = screen.getByRole('progressbar', { name: 'Profile completion' });
    expect(progress.getAttribute('aria-valuenow')).toBe('0');
  });

  it('hides the completion prompt once the profile is complete', () => {
    renderDashboard('en', {
      profile: {
        fullName: 'Asha Devi',
        hasPersonalDetails: true,
        hasContactDetails: true,
        hasAddress: true,
        hasCategory: true,
        hasEducation: true,
        hasPhoto: true,
        hasSignature: true,
        hasIdentityDocument: true,
      },
    });
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('shows an empty state when there are no applications', () => {
    renderDashboard('en', { applications: [], counts: summariseApplications([]), upcoming: [] });
    expect(screen.getByText('You have not started an application yet.')).toBeDefined();
    expect(screen.getByText('No deadlines or exam dates recorded yet.')).toBeDefined();
  });

  it('renders Hindi copy when the locale is hi', () => {
    renderDashboard('hi');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('वापसी पर स्वागत है');
    expect(screen.getByText('त्वरित कार्य')).toBeDefined();
  });
});
