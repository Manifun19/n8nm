import type {
  ApplicationCard,
  ApplicationStatus,
  ApplicationSummaryCounts,
  CandidateProfileSummary,
  UpcomingItem,
} from '@/types/domain';

/**
 * Pure dashboard logic. Kept out of components so it can be unit tested and
 * later reused by the future Flutter client through the API layer.
 */

const EMPTY_COUNTS: ApplicationSummaryCounts = {
  draft: 0,
  in_progress: 0,
  submitted: 0,
  payment_pending: 0,
  completed: 0,
};

/**
 * Buckets the nine persisted statuses into the five the dashboard shows.
 * `preparing`, `review_required` and `correction_required` all mean "the user
 * still has work to do", so they roll up into `in_progress`.
 */
export function summariseApplications(
  applications: readonly ApplicationCard[],
): ApplicationSummaryCounts {
  return applications.reduce<ApplicationSummaryCounts>(
    (counts, application) => {
      const bucket = bucketForStatus(application.status);
      if (bucket) counts[bucket] += 1;
      return counts;
    },
    { ...EMPTY_COUNTS },
  );
}

export function bucketForStatus(
  status: ApplicationStatus,
): keyof ApplicationSummaryCounts | null {
  switch (status) {
    case 'draft':
      return 'draft';
    case 'preparing':
    case 'in_progress':
    case 'review_required':
    case 'correction_required':
      return 'in_progress';
    case 'payment_pending':
      return 'payment_pending';
    case 'submitted':
      return 'submitted';
    case 'completed':
      return 'completed';
    case 'failed':
      return null;
    default:
      return null;
  }
}

/** Days until a date, relative to `now`. Negative when the date has passed. */
export function daysUntil(isoDate: string, now: Date = new Date()): number {
  const target = Date.parse(isoDate);
  if (Number.isNaN(target)) return Number.NaN;

  const startOfTarget = new Date(target);
  startOfTarget.setHours(0, 0, 0, 0);
  const startOfNow = new Date(now);
  startOfNow.setHours(0, 0, 0, 0);

  return Math.round((startOfTarget.getTime() - startOfNow.getTime()) / 86_400_000);
}

/** Upcoming items, soonest first, excluding anything already in the past. */
export function sortUpcoming(
  items: readonly UpcomingItem[],
  now: Date = new Date(),
  limit = 5,
): UpcomingItem[] {
  return items
    .filter((item) => {
      const days = daysUntil(item.date, now);
      return Number.isFinite(days) && days >= 0;
    })
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, limit);
}

/** Fields that make a profile reusable across applications (spec §16). */
const PROFILE_CHECKS = [
  'hasPersonalDetails',
  'hasContactDetails',
  'hasAddress',
  'hasCategory',
  'hasEducation',
  'hasPhoto',
  'hasSignature',
  'hasIdentityDocument',
] as const satisfies readonly (keyof CandidateProfileSummary)[];

/** Percentage 0–100 of the reusable profile that is filled in. */
export function profileCompletionPercent(profile: CandidateProfileSummary): number {
  const done = PROFILE_CHECKS.filter((key) => profile[key] === true).length;
  return Math.round((done / PROFILE_CHECKS.length) * 100);
}

export const EMPTY_PROFILE_SUMMARY: CandidateProfileSummary = {
  fullName: null,
  hasPersonalDetails: false,
  hasContactDetails: false,
  hasAddress: false,
  hasCategory: false,
  hasEducation: false,
  hasPhoto: false,
  hasSignature: false,
  hasIdentityDocument: false,
};
