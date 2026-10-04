import type { TranslationKey } from '@/lib/i18n';

/**
 * Error handling policy (see §32 of the product spec):
 *  - developers get the technical detail through `logError`
 *  - users only ever see a translated, non-technical message
 *
 * Nothing in this module may log document contents, OTPs, passwords,
 * identity numbers or payment details.
 */

export interface UserFacingError {
  messageKey: TranslationKey;
}

const REDACTED = '[redacted]';

/** Keys whose values must never reach a log sink. */
const SENSITIVE_KEY_PATTERN =
  /(aadhaar|aadhar|otp|password|passwd|secret|token|authorization|apikey|api_key|card|cvv|upi|account_number|pan)/i;

export function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 4) return REDACTED;

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactSensitive(item, depth + 1),
      ]),
    );
  }

  return value;
}

/** Writes a developer-only log entry. Never called with raw user documents. */
export function logError(scope: string, error: unknown, context?: Record<string, unknown>): void {
  const detail = error instanceof Error ? { name: error.name, message: error.message } : { error };

  // Developer log channel — deliberately the only console call in the app.
  console.error(`[ai-formmate:${scope}]`, {
    ...detail,
    ...(context ? { context: redactSensitive(context) } : {}),
  });
}

/** Maps an unknown failure onto a safe, translatable message key. */
export function toUserFacingError(
  error: unknown,
  fallbackKey: TranslationKey = 'error.body',
): UserFacingError {
  if (error instanceof Error && 'messageKey' in error) {
    const key = (error as Error & { messageKey?: unknown }).messageKey;
    if (typeof key === 'string') {
      return { messageKey: key as TranslationKey };
    }
  }

  return { messageKey: fallbackKey };
}
