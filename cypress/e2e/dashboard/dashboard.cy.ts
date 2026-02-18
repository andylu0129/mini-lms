describe('Student Dashboard', () => {
  beforeEach(() => {
    cy.signIn();
    cy.visit('/dashboard');
  });

  it('displays a personalised welcome message', () => {
    cy.contains('Welcome').should('be.visible');
  });

  it('displays the stats panel with all five stat labels', () => {
    cy.contains(/total/i).should('be.visible');
    cy.contains(/upcoming/i).should('be.visible');
    cy.contains(/pending/i).should('be.visible');
    cy.contains(/complete/i).should('be.visible');
    cy.contains(/incomplete/i).should('be.visible');
  });

  it('navigates to the consultation booking page via the Book Consultation button', () => {
    cy.contains('button', 'Book Consultation').click();
    cy.url().should('include', '/dashboard/consultation-booking');
  });

  it('shows the search input', () => {
    cy.get('[aria-label="Search consultations"]').should('be.visible');
  });

  it('sets the All filter button as active by default', () => {
    cy.contains('button', 'all').should('have.attr', 'data-is-active', 'true');
  });

  it('switches the active filter when a different filter button is clicked', () => {
    cy.contains('button', 'upcoming').click();
    cy.contains('button', 'upcoming').should('have.attr', 'data-is-active', 'true');
    cy.contains('button', 'all').should('have.attr', 'data-is-active', 'false');
  });

  it('shows an empty state when the search term matches nothing', () => {
    cy.get('[aria-label="Search consultations"]').type('zzznoresultszzz');
    cy.contains('No consultations found').should('be.visible');
  });

  it('signs out and redirects to the sign-in page', () => {
    cy.contains('button', 'Sign Out').click();
    cy.url().should('include', '/auth/sign-in');
  });
});
