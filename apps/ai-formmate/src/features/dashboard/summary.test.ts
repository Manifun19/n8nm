import { describe, expect, it } from 'vitest';
import type { ApplicationCard, ApplicationStatus, UpcomingItem } from '@/types/domain';
import { APPLICATION_STATUSES } from '@/types/domain';
import {
  bucketForStatus,
  daysUntil,
  EMPTY_PROFILE_SUMMARY,
  profileCompletionPercent,
  sortUpcoming,
  summariseApplications,
} from './summary';

function application(status: ApplicationStatus, id: string = status): ApplicationCard {
  return {
    id,
    examName: 'SSC CGL',
    organization: 'SSC',
    post: null,
    applicationNumber: null,
    status,
    applicationDate: null,
    deadline: null,
    documentCount: 0,
    hasPdf: false,
    screenshotCount: 0,
  };
}

describe('bucketForStatus', () => {
  it('assigns a bucket to every persisted status', () => {
    for (const status of APPLICATION_STATUSES) {
      // `failed` deliberately has no dashboard bucket.
      const bucket = bucketForStatus(status);
      expect(status === 'failed' ? bucket : typeof bucket).toBe(
        status === 'failed' ? null : 'string',
      );
    }
  });

  it('rolls work-in-progress statuses together', () => {
    expect(bucketForStatus('preparing')).toBe('in_progress');
    expect(bucketForStatus('review_required')).toBe('in_progress');
    expect(bucketForStatus('correction_required')).toBe('in_progress');
  });
});

describe('summariseApplications', () => {
  it('returns zeroes for no applications', () => {
    expect(summariseApplications([])).toEqual({
      draft: 0,
      in_progress: 0,
      submitted: 0,
      payment_pending: 0,
      completed: 0,
    });
  });

  it('counts each bucket', () => {
    const counts = summariseApplications([
      application('draft', 'a'),
      application('preparing', 'b'),
      application('in_progress', 'c'),
      application('payment_pending', 'd'),
      application('submitted', 'e'),
      application('completed', 'f'),
      application('failed', 'g'),
    ]);

    expect(counts).toEqual({
      draft: 1,
      in_progress: 2,
      submitted: 1,
      payment_pending: 1,
      completed: 1,
    });
  });
});

describe('daysUntil', () => {
  const now = new Date('2026-03-10T09:30:00.000Z');

  it('counts whole days forward', () => {
    expect(daysUntil('2026-03-15', now)).toBe(5);
  });

  it('returns zero for today', () => {
    expect(daysUntil('2026-03-10', now)).toBe(0);
  });

  it('returns a negative number for the past', () => {
    expect(daysUntil('2026-03-01', now)).toBe(-9);
  });

  it('returns NaN for an unparseable date', () => {
    expect(Number.isNaN(daysUntil('not-a-date', now))).toBe(true);
  });
});

describe('sortUpcoming', () => {
  const now = new Date('2026-03-10T00:00:00.000Z');

  const items: UpcomingItem[] = [
    { id: '1', kind: 'exam_date', title: 'Exam', date: '2026-04-01' },
    { id: '2', kind: 'deadline', title: 'Deadline', date: '2026-03-12' },
    { id: '3', kind: 'update', title: 'Old', date: '2026-02-01' },
    { id: '4', kind: 'admit_card', title: 'Admit card', date: '2026-03-20' },
  ];

  it('drops past items and sorts by soonest', () => {
    expect(sortUpcoming(items, now).map((item) => item.id)).toEqual(['2', '4', '1']);
  });

  it('respects the limit', () => {
    expect(sortUpcoming(items, now, 2)).toHaveLength(2);
  });

  it('ignores unparseable dates', () => {
    const bad: UpcomingItem[] = [{ id: 'x', kind: 'update', title: 'Bad', date: 'soon' }];
    expect(sortUpcoming(bad, now)).toEqual([]);
  });
});

describe('profileCompletionPercent', () => {
  it('is zero for an empty profile', () => {
    expect(profileCompletionPercent(EMPTY_PROFILE_SUMMARY)).toBe(0);
  });

  it('is 100 for a complete profile', () => {
    expect(
      profileCompletionPercent({
        fullName: 'Asha Devi',
        hasPersonalDetails: true,
        hasContactDetails: true,
        hasAddress: true,
        hasCategory: true,
        hasEducation: true,
        hasPhoto: true,
        hasSignature: true,
        hasIdentityDocument: true,
      }),
    ).toBe(100);
  });

  it('rounds partial completion', () => {
    expect(
      profileCompletionPercent({
        ...EMPTY_PROFILE_SUMMARY,
        hasPersonalDetails: true,
        hasContactDetails: true,
      }),
    ).toBe(25);
  });
});
