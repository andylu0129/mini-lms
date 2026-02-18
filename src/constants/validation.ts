export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
  FIRST_NAME_REQUIRED: 'First name is required',
  LAST_NAME_REQUIRED: 'Last name is required',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_MAX: 'Password must be at most 64 characters',
  PASSWORD_COMPLEXITY:
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  REASON_REQUIRED: 'Reason for consultation is required',
  DATETIME_REQUIRED: 'Date and time is required',
  DATETIME_FUTURE: 'Date and time must be in the future',
} as const;
