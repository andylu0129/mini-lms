import { VALIDATION } from '@/constants/validation';
import { consultationBookingFormSchema, signInFormSchema, signUpFormSchema } from '@/lib/zod/schemas/form-schema';
import { expect, it } from 'vitest';

describe('signUpFormSchema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  };

  it('accepts valid sign-up data', () => {
    expect(signUpFormSchema.safeParse(validData).success).toBe(true);
  });

  describe('firstName', () => {
    it('rejects an empty first name', () => {
      const result = signUpFormSchema.safeParse({ ...validData, firstName: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('firstName'));
        expect(issue?.message).toBe(VALIDATION.FIRST_NAME_REQUIRED);
      }
    });
  });

  describe('lastName', () => {
    it('rejects an empty last name', () => {
      const result = signUpFormSchema.safeParse({ ...validData, lastName: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('lastName'));
        expect(issue?.message).toBe(VALIDATION.LAST_NAME_REQUIRED);
      }
    });
  });

  describe('email', () => {
    it.each([
      ['missing @', 'invalidemail'],
      ['missing domain', 'user@'],
      ['missing local part', '@example.com'],
    ])('rejects an email with %s', (_, email) => {
      expect(signUpFormSchema.safeParse({ ...validData, email }).success).toBe(false);
    });
  });

  describe('password', () => {
    it('rejects a password shorter than the minimum length (7 chars)', () => {
      const shortPw = 'Ab1!567';
      const result = signUpFormSchema.safeParse({ ...validData, password: shortPw, confirmPassword: shortPw });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('password'));
        expect(issue?.message).toBe(VALIDATION.PASSWORD_MIN);
      }
    });

    it('accepts a password at exactly the minimum length (8 chars)', () => {
      const minPw = 'Ab1!5678';
      expect(signUpFormSchema.safeParse({ ...validData, password: minPw, confirmPassword: minPw }).success).toBe(true);
    });

    it('rejects a password longer than the maximum length (65 chars)', () => {
      const longPw = 'Ab1!' + 'a'.repeat(61);
      const result = signUpFormSchema.safeParse({ ...validData, password: longPw, confirmPassword: longPw });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('password'));
        expect(issue?.message).toBe(VALIDATION.PASSWORD_MAX);
      }
    });

    it('accepts a password at exactly the maximum length (64 chars)', () => {
      const maxPw = 'Ab1!' + 'a'.repeat(60);
      expect(signUpFormSchema.safeParse({ ...validData, password: maxPw, confirmPassword: maxPw }).success).toBe(true);
    });

    it.each([
      ['no uppercase letter', 'password1!', 'password1!'],
      ['no lowercase letter', 'PASSWORD1!', 'PASSWORD1!'],
      ['no digit', 'Password!!', 'Password!!'],
      ['no special character', 'Password11', 'Password11'],
    ])('rejects a password with %s', (_, password, confirmPassword) => {
      const result = signUpFormSchema.safeParse({ ...validData, password, confirmPassword });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('password'));
        expect(issue?.message).toBe(VALIDATION.PASSWORD_COMPLEXITY);
      }
    });
  });

  describe('confirmPassword', () => {
    it('rejects when passwords do not match', () => {
      const result = signUpFormSchema.safeParse({ ...validData, confirmPassword: 'DifferentPassword1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes('confirmPassword'));
        expect(issue?.message).toBe(VALIDATION.PASSWORDS_DO_NOT_MATCH);
      }
    });

    it('accepts when passwords match exactly', () => {
      expect(signUpFormSchema.safeParse(validData).success).toBe(true);
    });
  });
});

describe('signInFormSchema', () => {
  const validData = {
    email: 'user@example.com',
    password: 'Password1!',
  };

  it('accepts valid sign-in data', () => {
    expect(signInFormSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    expect(signInFormSchema.safeParse({ ...validData, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a password shorter than the minimum length (7 chars)', () => {
    const result = signInFormSchema.safeParse({ ...validData, password: 'Ab1!567' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('password'));
      expect(issue?.message).toBe(VALIDATION.PASSWORD_MIN);
    }
  });

  it('rejects a password longer than the maximum length (65 chars)', () => {
    const longPw = 'Ab1!' + 'a'.repeat(61);
    const result = signInFormSchema.safeParse({ ...validData, password: longPw });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('password'));
      expect(issue?.message).toBe(VALIDATION.PASSWORD_MAX);
    }
  });

  it('rejects a password that does not meet complexity requirements', () => {
    const result = signInFormSchema.safeParse({ ...validData, password: 'simplepassword' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('password'));
      expect(issue?.message).toBe(VALIDATION.PASSWORD_COMPLEXITY);
    }
  });
});

describe('consultationBookingFormSchema', () => {
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const pastDate = new Date('2020-01-01T00:00:00Z');

  it('accepts a valid reason and a future date', () => {
    expect(consultationBookingFormSchema.safeParse({ reason: 'Career advice', scheduledAt: futureDate }).success).toBe(
      true,
    );
  });

  it('rejects an empty reason', () => {
    const result = consultationBookingFormSchema.safeParse({ reason: '', scheduledAt: futureDate });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('reason'));
      expect(issue?.message).toBe(VALIDATION.REASON_REQUIRED);
    }
  });

  it('rejects a scheduledAt date in the past', () => {
    const result = consultationBookingFormSchema.safeParse({ reason: 'Career advice', scheduledAt: pastDate });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('scheduledAt'));
      expect(issue?.message).toBe(VALIDATION.DATETIME_FUTURE);
    }
  });

  it('rejects a non-Date value for scheduledAt', () => {
    expect(
      consultationBookingFormSchema.safeParse({ reason: 'Career advice', scheduledAt: 'not-a-date' }).success,
    ).toBe(false);
  });

  it('rejects when scheduledAt is missing', () => {
    expect(consultationBookingFormSchema.safeParse({ reason: 'Career advice' }).success).toBe(false);
  });

  it('rejects when both fields are missing', () => {
    expect(consultationBookingFormSchema.safeParse({}).success).toBe(false);
  });
});
