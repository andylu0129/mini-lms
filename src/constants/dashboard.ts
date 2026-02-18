export const DASHBOARD = {
  WELCOME_PREFIX: 'Welcome, ',
  TITLE: 'My Consultations',
  SUBTITLE: 'Manage and track your consultation appointments',
  PAGINATION_SIZE: 10,
  RETRY: 'Retry',
  NO_CONSULTATIONS: {
    TITLE: 'No consultations found',
    DESCRIPTION: 'Book your consultation to get started.',
  },
  SEARCH: {
    DEBOUNCE_MS: 300,
    PLACEHOLDER: 'Search by reason...',
    ARIA_LABEL: 'Search consultations',
  },
  ERROR: {
    TITLE: 'Something went wrong',
    DESCRIPTION: "We couldn't load your consultations. Please try again.",
  },
  STATS: {
    TOTAL: 'total',
  },
} as const;
