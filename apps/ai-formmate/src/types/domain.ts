/**
 * Core domain types shared by the UI and the service layer.
 *
 * These intentionally mirror the database schema in
 * `supabase/migrations/0001_init.sql`.
 */

export const APPLICATION_STATUSES = [
  'draft',
  'preparing',
  'in_progress',
  'review_required',
  'payment_pending',
  'submitted',
  'failed',
  'correction_required',
  'completed',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const CATEGORIES = ['general', 'obc', 'sc', 'st', 'ews', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = ['single', 'married', 'other', 'prefer_not_to_say'] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const EDUCATION_LEVELS = [
  'class_10',
  'class_12',
  'diploma',
  'graduation',
  'post_graduation',
  'other',
] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const DOCUMENT_CATEGORIES = [
  'identity_aadhaar',
  'pan',
  'marksheet_10',
  'certificate_10',
  'marksheet_12',
  'certificate_12',
  'graduation_marksheet',
  'degree',
  'caste_certificate',
  'ews_certificate',
  'domicile',
  'ncl_certificate',
  'experience_certificate',
  'disability_certificate',
  'other',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const VERIFICATION_STATUSES = ['unverified', 'self_verified', 'needs_attention'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/**
 * Provenance of a piece of information. The UI must always be able to tell the
 * user whether something came from an official source, from an AI reading of a
 * document, or from the user themselves.
 */
export const INFORMATION_SOURCES = ['official', 'ai_interpretation', 'user_entered'] as const;
export type InformationSource = (typeof INFORMATION_SOURCES)[number];

/** Confidence attached to an AI-produced mapping or extraction. */
export const CONFIDENCE_LEVELS = ['high', 'medium', 'low'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export type UpcomingItemKind = 'deadline' | 'exam_date' | 'admit_card' | 'update';

export interface UpcomingItem {
  id: string;
  kind: UpcomingItemKind;
  title: string;
  /** ISO-8601 date string. */
  date: string;
  applicationId?: string;
}

export interface ApplicationSummaryCounts {
  draft: number;
  in_progress: number;
  submitted: number;
  payment_pending: number;
  completed: number;
}

export interface ApplicationCard {
  id: string;
  examName: string;
  organization: string | null;
  post: string | null;
  applicationNumber: string | null;
  status: ApplicationStatus;
  /** ISO-8601 date string, or null while still a draft. */
  applicationDate: string | null;
  deadline: string | null;
  documentCount: number;
  hasPdf: boolean;
  screenshotCount: number;
}

export interface CandidateProfileSummary {
  fullName: string | null;
  hasPersonalDetails: boolean;
  hasContactDetails: boolean;
  hasAddress: boolean;
  hasCategory: boolean;
  hasEducation: boolean;
  hasPhoto: boolean;
  hasSignature: boolean;
  hasIdentityDocument: boolean;
}
