import type { Metadata } from 'next';
import { isSupabaseConfigured } from '@/config/env';
import { getTranslator } from '@/lib/i18n';
import { getCurrentLocale } from '@/lib/i18n/server';
import { AuthForm } from '@/features/auth/auth-form';
import { signInAction } from '@/features/auth/actions';

export async function generateMetadata(): Promise<Metadata> {
  const t = getTranslator(await getCurrentLocale());
  return { title: t('auth.signIn') };
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthForm
      mode="sign-in"
      action={signInAction}
      configured={isSupabaseConfigured()}
      {...(next ? { next } : {})}
    />
  );
}
