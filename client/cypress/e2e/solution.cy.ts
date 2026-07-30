const TIMESTAMP_SOL = Date.now()

const USER_SOL = {
  username: `user_sol_${TIMESTAMP_SOL}`,
  email: `user_sol_${TIMESTAMP_SOL}@revix.com`,
  password: 'password123',
}

describe('E2E-SOL-01: Aggiunta soluzione', () => {
  let carId: string
  let problemTitle: string

  before(() => {
    cy.request('POST', 'http://localhost:3000/api/auth/register', USER_SOL)

    cy.request('POST', 'http://localhost:3000/api/auth/login', {
      email: USER_SOL.email,
      password: USER_SOL.password,
    }).then(res => {
      const token = res.body.token

      cy.request('GET', 'http://localhost:3000/api/cars').then(carsRes => {
        carId = carsRes.body[0].id
        problemTitle = `Problema soluzione ${TIMESTAMP_SOL}`

        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/api/problems',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            car_id: carId,
            title: problemTitle,
            description: 'Descrizione problema per test soluzione E2E',
            category: 'BRAKES',
          },
        })
      })
    })
  })

  it('E2E-SOL-01: utente aggiunge una soluzione e la vede nella lista', () => {
    cy.login(USER_SOL.email, USER_SOL.password)
    cy.visit(`/cars/${carId}`)

    cy.contains(problemTitle).should('be.visible')

    // Apri soluzioni
    cy.contains(problemTitle)
      .closest('div[id^="problem-"]')
      .find('button')
      .contains('Vedi soluzioni ↗')
      .click()

    // Apri form soluzione
    cy.contains('+ Aggiungi soluzione').click()

    // Scrivi la soluzione
    cy.get('textarea[placeholder*="Come hai risolto"]').type(
      'Soluzione test Cypress: sostituire le pastiglie freni anteriori'
    )

    // Invia
    cy.contains('button', 'Pubblica soluzione').click()

    // Verifica che appaia
    cy.contains('Soluzione test Cypress').should('be.visible')
  })
})