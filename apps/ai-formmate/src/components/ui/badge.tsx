import { cn } from '@/lib/utils/cn';
import type { ApplicationStatus, InformationSource } from '@/types/domain';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-muted border-line',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  brand: 'bg-brand-50 text-brand-800 border-brand-200',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Visual tone for each application status. Copy comes from the catalogue. */
export const STATUS_TONES: Record<ApplicationStatus, BadgeTone> = {
  draft: 'neutral',
  preparing: 'info',
  in_progress: 'info',
  review_required: 'warning',
  payment_pending: 'warning',
  submitted: 'success',
  failed: 'danger',
  correction_required: 'danger',
  completed: 'success',
};

/** Provenance badges keep official facts visually distinct from AI output. */
export const SOURCE_TONES: Record<InformationSource, BadgeTone> = {
  official: 'success',
  ai_interpretation: 'warning',
  user_entered: 'neutral',
};
