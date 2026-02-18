describe('Sign Up', () => {
  beforeEach(() => {
    cy.visit('/auth/sign-up');
  });

  it('displays the sign-up form', () => {
    cy.contains('div', 'Create your account').should('be.visible');
    cy.get('#signup-first-name').should('be.visible');
    cy.get('#signup-last-name').should('be.visible');
    cy.get('#signup-email').should('be.visible');
    cy.get('#signup-password').should('be.visible');
    cy.get('#signup-confirm-password').should('be.visible');
    cy.contains('button[type="submit"]', 'Create Account').should('be.visible');
  });

  it('navigates to sign-in page via the sign-in link', () => {
    cy.contains('button[type="button"]', 'Sign in').click();
    cy.url().should('include', '/auth/sign-in');
  });

  it('shows validation errors when submitting an empty form', () => {
    cy.contains('button[type="submit"]', 'Create Account').click();
    cy.contains('First name is required').should('be.visible');
  });

  it('shows an error when passwords do not match', () => {
    cy.get('#signup-first-name').type('John');
    cy.get('#signup-last-name').type('Doe');
    cy.get('#signup-email').type('john@example.com');
    cy.get('#signup-password').type('Password1!');
    cy.get('#signup-confirm-password').type('DifferentPassword1!');
    cy.contains('button[type="submit"]', 'Create Account').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('shows the success screen for a new registration', () => {
    const unique = Date.now();
    cy.get('#signup-first-name').type('Test');
    cy.get('#signup-last-name').type('User');
    cy.get('#signup-email').type(`test+${unique}@example.com`);
    cy.get('#signup-password').type('Password1!');
    cy.get('#signup-confirm-password').type('Password1!');
    cy.contains('button[type="submit"]', 'Create Account').click();
    cy.contains('Account Created Successfully').should('be.visible');
  });

  it('shows the success screen even when the email is already registered', () => {
    cy.get('#signup-first-name').type('John');
    cy.get('#signup-last-name').type('Doe');
    cy.env(['TEST_USER_EMAIL']).then((vars) => {
      cy.get('#signup-email').type((vars as Record<string, string>).TEST_USER_EMAIL);
    });
    cy.get('#signup-password').type('Password1!');
    cy.get('#signup-confirm-password').type('Password1!');
    cy.contains('button[type="submit"]', 'Create Account').click();
    cy.contains('Account Created Successfully').should('be.visible');
  });

  it('toggles password visibility', () => {
    cy.get('#signup-password').type('Password1!');
    cy.get('#signup-password').should('have.attr', 'type', 'password');
    cy.get('[aria-label="Show password"]').first().click();
    cy.get('#signup-password').should('have.attr', 'type', 'text');
    cy.get('[aria-label="Hide password"]').first().click();
    cy.get('#signup-password').should('have.attr', 'type', 'password');
  });
});
