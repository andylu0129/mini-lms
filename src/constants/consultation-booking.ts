export const CONSULTATION_BOOKING = {
  TITLE: 'Book a Consultation',
  DESCRIPTION: 'Fill out the details below to schedule a new session',
  BACK_TO_DASHBOARD: 'Back to Dashboard',
  SUCCESS: {
    TITLE: 'Consultation Booked',
    DESCRIPTION: 'Redirecting to your dashboard...',
    REDIRECT_DELAY_MS: 2000,
  },
  LABEL: {
    REASON: 'Reason for Consultation',
    DATETIME: 'Date and Time',
    FIRST_NAME: 'First Name',
    LAST_NAME: 'Last Name',
  },
  PLACEHOLDER: {
    REASON: 'Describe the purpose of your consultation...',
    FIRST_NAME: 'First name',
    LAST_NAME: 'Last name',
  },
  HINT: {
    REASON: 'Provide a brief description so the advisor can prepare.',
    DATETIME: 'Choose a date and time that works for you.',
  },
  ARIA: {
    BACK_TO_DASHBOARD: 'Back to dashboard',
  },
} as const;
