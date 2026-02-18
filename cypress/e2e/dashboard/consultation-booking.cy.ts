describe('Consultation Booking', () => {
  beforeEach(() => {
    cy.signIn();
    cy.visit('/dashboard/consultation-booking');
  });

  it('displays the booking form', () => {
    cy.contains('div', 'Book a Consultation').should('be.visible');
    cy.get('#booking-first-name').should('be.visible');
    cy.get('#booking-last-name').should('be.visible');
    cy.get('#booking-reason').should('be.visible');
    cy.get('#booking-datetime').should('be.visible');
    cy.contains('button', 'Book Consultation').should('be.visible');
  });

  it('pre-fills the first and last name fields from the signed-in user', () => {
    cy.get('#booking-first-name').should('not.have.value', '');
    cy.get('#booking-last-name').should('not.have.value', '');
  });

  it('disables the first and last name fields', () => {
    cy.get('#booking-first-name').should('be.disabled');
    cy.get('#booking-last-name').should('be.disabled');
  });

  it('navigates back to the dashboard via the back button', () => {
    cy.get('[aria-label="Back to dashboard"]').click();
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', '/consultation-booking');
  });

  it('navigates back to the dashboard via the Cancel button', () => {
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/dashboard');
    cy.url().should('not.include', '/consultation-booking');
  });

  it('shows a validation error when submitting without a reason', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    cy.get('#booking-datetime').type(future);
    cy.contains('button', 'Book Consultation').click();
    cy.contains('Reason for consultation is required').should('be.visible');
  });

  it('shows a validation error when submitting without a date', () => {
    cy.get('#booking-reason').type('Career advice');
    cy.contains('button', 'Book Consultation').click();
    cy.contains('Date and time is required').should('be.visible');
  });

  it('shows the success screen after a successful booking', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    cy.get('#booking-reason').type('Career advice');
    cy.get('#booking-datetime').type(future);
    cy.contains('button', 'Book Consultation').click();
    cy.contains('Consultation Booked').should('be.visible');
  });

  it('redirects to the dashboard after the booking success screen', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    cy.get('#booking-reason').type('Academic planning');
    cy.get('#booking-datetime').type(future);
    cy.contains('button', 'Book Consultation').click();
    cy.contains('Consultation Booked').should('be.visible');
    // The form redirects after REDIRECT_DELAY_MS (2000 ms).
    cy.url({ timeout: 5000 }).should('include', '/dashboard');
    cy.url().should('not.include', '/consultation-booking');
  });
});
