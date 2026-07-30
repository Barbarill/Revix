const TIMESTAMP_CONF = Date.now()

const USER_A = {
  username: `user_a_${TIMESTAMP_CONF}`,
  email: `user_a_${TIMESTAMP_CONF}@revix.com`,
  password: 'password123',
}
const USER_B = {
  username: `user_b_${TIMESTAMP_CONF}`,
  email: `user_b_${TIMESTAMP_CONF}@revix.com`,
  password: 'password123',
}

describe('E2E-CONF-01/02: Conferma problema', () => {
  let carId: string
  let problemTitle: string

  before(() => {
    // Registra entrambi gli utenti
    cy.request('POST', 'http://localhost:3000/api/auth/register', USER_A)
    cy.request('POST', 'http://localhost:3000/api/auth/register', USER_B)

    // USER_A crea un problema
    cy.request('POST', 'http://localhost:3000/api/auth/login', {
      email: USER_A.email,
      password: USER_A.password,
    }).then(res => {
      const token = res.body.token

      cy.request('GET', 'http://localhost:3000/api/cars').then(carsRes => {
        carId = carsRes.body[0].id
        problemTitle = `Problema conferma ${TIMESTAMP_CONF}`

        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/api/problems',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            car_id: carId,
            title: problemTitle,
            description: 'Descrizione problema per test conferma E2E',
            category: 'MOTOR',
          },
        })
      })
    })
  })

  it('E2E-CONF-01: USER_B vede il bottone conferma sul problema di USER_A', () => {
    cy.login(USER_B.email, USER_B.password)
    cy.visit(`/cars/${carId}`)

    cy.contains(problemTitle).should('be.visible')
    cy.contains('+ Conferma anche tu').should('be.visible')
  })

  it('E2E-CONF-02: USER_B conferma il problema e il contatore aumenta', () => {
    cy.login(USER_B.email, USER_B.password)
    cy.visit(`/cars/${carId}`)

    cy.contains(problemTitle)
      .closest('div[id^="problem-"]')
      .find('button')
      .contains('+ Conferma anche tu')
      .click()

    cy.contains(problemTitle)
      .closest('div[id^="problem-"]')
      .contains('✓ Confermato da te')
      .should('be.visible')
  })
})