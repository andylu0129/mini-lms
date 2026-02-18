describe('Sign In', () => {
  beforeEach(() => {
    cy.visit('/auth/sign-in');
  });

  it('displays the sign-in form', () => {
    cy.contains('div', 'Welcome back').should('be.visible');
    cy.get('#sign-in-email').should('be.visible');
    cy.get('#sign-in-password').should('be.visible');
    cy.contains('button[type="submit"]', 'Sign In').should('be.visible');
  });

  it('redirects unauthenticated users to sign-in when visiting the dashboard', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/auth/sign-in');
  });

  it('navigates to sign-up page via the sign-up link', () => {
    cy.contains('button[type="button"]', 'Create one').click();
    cy.url().should('include', '/auth/sign-up');
  });

  it('toggles password visibility', () => {
    cy.get('#sign-in-password').type('Password1!');
    cy.get('#sign-in-password').should('have.attr', 'type', 'password');
    cy.get('[aria-label="Show password"]').click();
    cy.get('#sign-in-password').should('have.attr', 'type', 'text');
    cy.get('[aria-label="Hide password"]').click();
    cy.get('#sign-in-password').should('have.attr', 'type', 'password');
  });

  it('shows an error message for invalid credentials', () => {
    cy.get('#sign-in-email').type('wrong@example.com');
    cy.get('#sign-in-password').type('WrongPassword1!');
    cy.contains('button[type="submit"]', 'Sign In').click();
    cy.contains('Invalid login credentials').should('be.visible');
  });

  it('redirects to the dashboard after a successful sign-in', () => {
    cy.env(['TEST_USER_EMAIL', 'TEST_USER_PASSWORD']).then((vars) => {
      const envVars = vars as Record<string, string>;
      cy.get('#sign-in-email').type(envVars.TEST_USER_EMAIL);
      cy.get('#sign-in-password').type(envVars.TEST_USER_PASSWORD);
      cy.contains('button[type="submit"]', 'Sign In').click();
      cy.url().should('include', '/dashboard');
    });
  });
});
