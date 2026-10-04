'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ROUTES } from '@/config/app';
import { useTranslation } from '@/lib/i18n/provider';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { TextField } from '@/components/ui/field';
import type { AuthFormState } from './actions';

type Mode = 'sign-in' | 'sign-up';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {label}
    </Button>
  );
}

interface AuthFormProps {
  mode: Mode;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  configured: boolean;
  next?: string;
}

export function AuthForm({ mode, action, configured, next }: AuthFormProps) {
  const { t } = useTranslation();
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, {});

  const isSignUp = mode === 'sign-up';

  if (state.checkEmail) {
    return (
      <Card>
        <CardBody className="space-y-2">
          <h1 className="text-lg font-semibold text-ink">{t('auth.checkEmail')}</h1>
          <p className="text-sm text-ink-muted">{t('auth.checkEmailBody')}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {t(isSignUp ? 'auth.signUpTitle' : 'auth.signInTitle')}
          </h1>
          <p className="text-sm text-ink-muted">
            {t(isSignUp ? 'auth.signUpSubtitle' : 'auth.signInSubtitle')}
          </p>
        </div>

        {!configured ? (
          <Alert tone="warning" title={t('auth.notConfigured')}>
            {t('auth.notConfiguredBody')}
          </Alert>
        ) : null}

        {state.errorKey ? <Alert tone="danger">{t(state.errorKey)}</Alert> : null}

        <form action={formAction} className="space-y-4" noValidate>
          {next ? <input type="hidden" name="next" value={next} /> : null}

          {isSignUp ? (
            <TextField
              id="fullName"
              name="fullName"
              label={t('auth.fullName')}
              autoComplete="name"
              required
              maxLength={120}
            />
          ) : null}

          <TextField
            id="email"
            name="email"
            type="email"
            inputMode="email"
            label={t('auth.email')}
            autoComplete="email"
            required
          />

          <TextField
            id="password"
            name="password"
            type="password"
            label={t('auth.password')}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            {...(isSignUp ? { hint: t('auth.passwordHint'), minLength: 8 } : {})}
          />

          <SubmitButton label={t(isSignUp ? 'auth.signUp' : 'auth.signIn')} />
        </form>

        {isSignUp ? <p className="text-xs text-ink-muted">{t('auth.consent')}</p> : null}

        <p className="text-sm text-ink-muted">
          {t(isSignUp ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
          <Link
            href={isSignUp ? ROUTES.signIn : ROUTES.signUp}
            className="font-medium text-brand-700 hover:underline"
          >
            {t(isSignUp ? 'auth.signIn' : 'auth.signUp')}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
