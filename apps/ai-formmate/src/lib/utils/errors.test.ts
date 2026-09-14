import { describe, expect, it, vi } from 'vitest';
import { logError, redactSensitive, toUserFacingError } from './errors';

describe('redactSensitive', () => {
  it('redacts sensitive keys at any depth', () => {
    const input = {
      email: 'user@example.com',
      otp: '123456',
      profile: { aadhaarNumber: '1111 2222 3333', name: 'Asha' },
      payment: [{ cardNumber: '4111111111111111' }],
    };

    expect(redactSensitive(input)).toEqual({
      email: 'user@example.com',
      otp: '[redacted]',
      profile: { aadhaarNumber: '[redacted]', name: 'Asha' },
      payment: [{ cardNumber: '[redacted]' }],
    });
  });

  it('leaves harmless values untouched', () => {
    expect(redactSensitive({ count: 3, ok: true })).toEqual({ count: 3, ok: true });
  });

  it('stops recursing on deeply nested structures', () => {
    const deep = { a: { b: { c: { d: { e: { f: 'x' } } } } } };
    expect(JSON.stringify(redactSensitive(deep))).toContain('[redacted]');
  });
});

describe('logError', () => {
  it('never writes sensitive context values', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('upload', new Error('storage exception'), { password: 'hunter2', file: 'a.pdf' });

    const payload = JSON.stringify(spy.mock.calls[0]);
    expect(payload).not.toContain('hunter2');
    expect(payload).toContain('[redacted]');
    expect(payload).toContain('storage exception');

    spy.mockRestore();
  });
});

describe('toUserFacingError', () => {
  it('falls back to a generic translatable key', () => {
    expect(toUserFacingError(new Error('Supabase storage exception'))).toEqual({
      messageKey: 'error.body',
    });
  });

  it('honours an explicit message key', () => {
    const error = Object.assign(new Error('boom'), { messageKey: 'auth.errorInvalidCredentials' });
    expect(toUserFacingError(error)).toEqual({ messageKey: 'auth.errorInvalidCredentials' });
  });
});
