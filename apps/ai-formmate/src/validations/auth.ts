import { z } from 'zod';

/**
 * Password policy for Phase 1. Deliberately simple and explainable to the
 * user — the hint string lives in the translation catalogue.
 */
export const passwordSchema = z
  .string()
  .min(8, 'auth.passwordHint')
  .refine((value) => /[A-Za-z]/.test(value) && /\d/.test(value), 'auth.passwordHint');

export const emailSchema = z.string().trim().toLowerCase().email();

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2).max(120),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
