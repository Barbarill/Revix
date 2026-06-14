const TIMESTAMP_AUTH = Date.now()
const TEST_USER_AUTH = {
  username: `testuser_auth_${TIMESTAMP_AUTH}`,
  email: `test_auth_${TIMESTAMP_AUTH}@revix.com`,
  password: 'password123',
}

describe('E2E-AUTH-01: Registrazione nuovo utente', () => {
  it('registra un nuovo utente e mostra il profilo in Navbar', () => {
    cy.visit('/register')

    cy.get('input[placeholder="il_tuo_username"]').type(TEST_USER_AUTH.username)
    cy.get('input[type="email"]').type(TEST_USER_AUTH.email)
    cy.get('input[type="password"]').type(TEST_USER_AUTH.password)

    cy.get('button').contains('Crea account').click()

    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    cy.contains(TEST_USER_AUTH.username).should('be.visible')
  })
})

describe('E2E-AUTH-02/03/04: Login, Logout e route protette', () => {
  before(() => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/register',
        body: TEST_USER_AUTH,
        failOnStatusCode: false,  // ignora 409 se l'utente esiste già
    })
    })

  it('E2E-AUTH-02: effettua login e mostra il profilo in Navbar', () => {
    cy.visit('/login')

    cy.get('input[type="email"]').type(TEST_USER_AUTH.email)
    cy.get('input[type="password"]').type(TEST_USER_AUTH.password)
    cy.get('button').contains('Accedi').click()

    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    cy.contains(TEST_USER_AUTH.username).should('be.visible')
  })

  it('E2E-AUTH-03: effettua logout e rimuove il token', () => {
    cy.login(TEST_USER_AUTH.email, TEST_USER_AUTH.password)

    cy.contains('Esci').click()

    cy.window().then(win => {
      expect(win.localStorage.getItem('token')).to.be.null
    })

    cy.contains('Accedi').should('be.visible')
  })

  it('E2E-AUTH-04: utente non loggato vede "Accedi per segnalare" invece del bottone', () => {
    cy.request('GET', 'http://localhost:3000/api/cars').then(res => {
      const firstCarId = res.body[0]?.id
      cy.visit(`/cars/${firstCarId}`)

      cy.contains('Accedi per segnalare').should('be.visible')
      cy.contains('+ Segnala problema').should('not.exist')
    })
  })
})