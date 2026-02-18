export const APP = {
  NAME: 'MiniLMS',
  TAGLINE: 'Student Consultation Portal',
} as const;

export const ERRORS = {
  AN_ERROR_OCCURRED: 'An error occurred',
  SIGN_IN_FAILED: 'Sign in failed. Please try again.',
  SIGN_UP_FAILED: 'Sign up failed. Please try again.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  CODE_USER_EXISTS: 'user_already_exists',
} as const;

export const BROADCAST = {
  CHANNEL_AUTH: 'auth',
  MESSAGE_SIGN_OUT: 'sign-out',
} as const;

export const COMMON_TEXT = {
  BOOK_CONSULTATION: 'Book Consultation',
  CANCEL: 'Cancel',
  SIGN_OUT: 'Sign Out',
} as const;

export const DB = {
  TABLE_CONSULTATIONS: 'consultations',
  VIEW_CONSULTATIONS_WITH_STATUS: 'consultations_with_status',
  PL_PGSQL_GET_CONSULTATION_COUNTS_BY_STATUS: 'get_consultation_counts_by_status',
} as const;
