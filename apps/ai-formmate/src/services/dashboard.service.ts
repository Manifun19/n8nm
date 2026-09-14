import 'server-only';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logError } from '@/lib/utils/errors';
import {
  EMPTY_PROFILE_SUMMARY,
  summariseApplications,
} from '@/features/dashboard/summary';
import type {
  ApplicationCard,
  ApplicationStatus,
  ApplicationSummaryCounts,
  CandidateProfileSummary,
  UpcomingItem,
} from '@/types/domain';
import { APPLICATION_STATUSES } from '@/types/domain';

export interface DashboardData {
  profile: CandidateProfileSummary;
  applications: ApplicationCard[];
  counts: ApplicationSummaryCounts;
  upcoming: UpcomingItem[];
}

interface ApplicationRow {
  id: string;
  exam_name: string;
  organization: string | null;
  post: string | null;
  application_number: string | null;
  status: string;
  application_date: string | null;
  deadline: string | null;
}

interface ProfileRow {
  full_name: string | null;
  date_of_birth: string | null;
  father_name: string | null;
  mobile: string | null;
  email: string | null;
  permanent_state: string | null;
  permanent_pin: string | null;
  category: string | null;
}

function toStatus(value: string): ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value)
    ? (value as ApplicationStatus)
    : 'draft';
}

const EMPTY_DASHBOARD: DashboardData = {
  profile: EMPTY_PROFILE_SUMMARY,
  applications: [],
  counts: summariseApplications([]),
  upcoming: [],
};

/**
 * Loads everything the dashboard shows for the signed-in user.
 *
 * All queries run through the request-scoped Supabase client, so RLS scopes
 * them to the caller. A failure degrades to an empty dashboard rather than
 * surfacing a database error to the user.
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return EMPTY_DASHBOARD;

  try {
    const [profileResult, applicationsResult, educationResult, mediaResult, notificationsResult] =
      await Promise.all([
        supabase
          .from('profiles')
          .select(
            'full_name, date_of_birth, father_name, mobile, email, permanent_state, permanent_pin, category',
          )
          .eq('user_id', userId)
          .is('deleted_at', null)
          .maybeSingle(),
        supabase
          .from('applications')
          .select(
            'id, exam_name, organization, post, application_number, status, application_date, deadline',
          )
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(20),
        supabase
          .from('education_records')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .is('deleted_at', null),
        supabase
          .from('photos')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .is('deleted_at', null),
        supabase
          .from('notifications')
          .select('id, kind, title, due_at, application_id')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .not('due_at', 'is', null)
          .order('due_at', { ascending: true })
          .limit(10),
      ]);

    const profileRow = (profileResult.data ?? null) as ProfileRow | null;
    const applicationRows = (applicationsResult.data ?? []) as ApplicationRow[];

    const applications: ApplicationCard[] = applicationRows.map((row) => ({
      id: row.id,
      examName: row.exam_name,
      organization: row.organization,
      post: row.post,
      applicationNumber: row.application_number,
      status: toStatus(row.status),
      applicationDate: row.application_date,
      deadline: row.deadline,
      // Populated in later phases once the vault and PDF modules exist.
      documentCount: 0,
      hasPdf: false,
      screenshotCount: 0,
    }));

    const upcoming: UpcomingItem[] = [
      ...applications
        .filter((application) => application.deadline !== null)
        .map<UpcomingItem>((application) => ({
          id: `deadline-${application.id}`,
          kind: 'deadline',
          title: application.examName,
          date: application.deadline as string,
          applicationId: application.id,
        })),
      ...((notificationsResult.data ?? []) as {
        id: string;
        kind: string;
        title: string;
        due_at: string;
        application_id: string | null;
      }[]).map<UpcomingItem>((row) => ({
        id: `notification-${row.id}`,
        kind:
          row.kind === 'exam_date' || row.kind === 'admit_card' || row.kind === 'deadline'
            ? row.kind
            : 'update',
        title: row.title,
        date: row.due_at,
        ...(row.application_id ? { applicationId: row.application_id } : {}),
      })),
    ];

    const profile: CandidateProfileSummary = {
      fullName: profileRow?.full_name ?? null,
      hasPersonalDetails: Boolean(
        profileRow?.full_name && profileRow.date_of_birth && profileRow.father_name,
      ),
      hasContactDetails: Boolean(profileRow?.mobile && profileRow.email),
      hasAddress: Boolean(profileRow?.permanent_state && profileRow.permanent_pin),
      hasCategory: Boolean(profileRow?.category),
      hasEducation: (educationResult.count ?? 0) > 0,
      hasPhoto: (mediaResult.count ?? 0) > 0,
      // Filled in by Phases 3 and 5.
      hasSignature: false,
      hasIdentityDocument: false,
    };

    return {
      profile,
      applications,
      counts: summariseApplications(applications),
      upcoming,
    };
  } catch (error) {
    logError('dashboard.load', error, { userId: 'present' });
    return EMPTY_DASHBOARD;
  }
}
