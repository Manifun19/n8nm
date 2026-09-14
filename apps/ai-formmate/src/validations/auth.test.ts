import { describe, expect, it } from 'vitest';
import { passwordSchema, signInSchema, signUpSchema } from './auth';

describe('passwordSchema', () => {
  it.each(['abcdefg1', 'Str0ngPassword', 'aaaaaaa9'])('accepts %s', (value) => {
    expect(passwordSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ['too short', 'ab1'],
    ['letters only', 'abcdefghij'],
    ['digits only', '1234567890'],
    ['empty', ''],
  ])('rejects %s', (_label, value) => {
    expect(passwordSchema.safeParse(value).success).toBe(false);
  });
});

describe('signInSchema', () => {
  it('normalises the email address', () => {
    const result = signInSchema.parse({ email: '  User@Example.COM ', password: 'x' });
    expect(result.email).toBe('user@example.com');
  });

  it('rejects a malformed email', () => {
    expect(signInSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('requires a plausible full name', () => {
    expect(
      signUpSchema.safeParse({ email: 'a@b.com', password: 'abcdefg1', fullName: 'A' }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ email: 'a@b.com', password: 'abcdefg1', fullName: 'Asha Devi' })
        .success,
    ).toBe(true);
  });
});
