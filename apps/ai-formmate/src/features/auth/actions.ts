'use server';

import { redirect } from 'next/navigation';
import { getSiteUrl, isSupabaseConfigured } from '@/config/env';
import { ROUTES } from '@/config/app';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { TranslationKey } from '@/lib/i18n';
import { logError } from '@/lib/utils/errors';
import { signInSchema, signUpSchema } from '@/validations/auth';

export interface AuthFormState {
  /** Translation key for the message shown to the user. Never a raw error. */
  errorKey?: TranslationKey;
  /** Set after sign-up when the account still needs email confirmation. */
  checkEmail?: boolean;
}

/** Only allow same-origin relative redirects, to prevent open redirects. */
function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ROUTES.dashboard;
  if (!value.startsWith('/') || value.startsWith('//')) return ROUTES.dashboard;
  return value;
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { errorKey: 'auth.notConfiguredBody' };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errorKey: 'auth.errorInvalidCredentials' };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { errorKey: 'auth.notConfiguredBody' };

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Deliberately generic: never reveal whether the address is registered.
    logError('auth.signIn', error);
    return { errorKey: 'auth.errorInvalidCredentials' };
  }

  redirect(safeNextPath(formData.get('next')));
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { errorKey: 'auth.notConfiguredBody' };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });

  if (!parsed.success) {
    const failedPassword = parsed.error.issues.some((issue) => issue.path[0] === 'password');
    return { errorKey: failedPassword ? 'auth.passwordHint' : 'auth.errorGeneric' };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { errorKey: 'auth.notConfiguredBody' };

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getSiteUrl()}${ROUTES.authCallback}`,
    },
  });

  if (error) {
    logError('auth.signUp', error);
    return { errorKey: 'auth.errorGeneric' };
  }

  // Supabase returns a user with no identities when the address already exists.
  if (data.user && data.user.identities?.length === 0) {
    return { errorKey: 'auth.errorEmailTaken' };
  }

  if (!data.session) {
    return { checkEmail: true };
  }

  redirect(ROUTES.dashboard);
}
