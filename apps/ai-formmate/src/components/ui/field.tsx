import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

/**
 * Accessible text input: the label is always associated with the control, and
 * hint/error text is wired through `aria-describedby`.
 */
export function TextField({ id, label, hint, error, className, ...props }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          'block h-11 w-full rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink',
          'placeholder:text-ink-muted focus:border-brand-500',
          error && 'border-red-400',
          className,
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
