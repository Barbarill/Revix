const TIMESTAMP_PROB = Date.now()
const TEST_USER_PROB = {
  username: `testuser_prob_${TIMESTAMP_PROB}`,
  email: `test_prob_${TIMESTAMP_PROB}@revix.com`,
  password: 'password123',
}

describe('E2E-PROB-01: Segnalazione problema', () => {
  before(() => {
    cy.request('POST', 'http://localhost:3000/api/auth/register', TEST_USER_PROB)
  })

  it('utente loggato segnala un problema e lo vede nella lista', () => {
    cy.login(TEST_USER_PROB.email, TEST_USER_PROB.password)

    cy.request('GET', 'http://localhost:3000/api/cars').then(res => {
      const firstCarId = res.body[0]?.id
      cy.visit(`/cars/${firstCarId}`)

      // Aspetta che la pagina sia caricata
      cy.contains('Problemi segnalati').should('be.visible')

      // Apri il form
      cy.contains('+ Segnala problema').click()

      // Aspetta che il form sia visibile
      cy.contains('Segnala un problema').should('be.visible')

      // Seleziona categoria BRAKES dentro il form
      cy.contains('Segnala un problema')
        .parent()
        .find('select')
        .select('BRAKES')

      // Titolo
      cy.contains('Segnala un problema')
        .parent()
        .find('input[type="text"]')
        .type('Problema test Cypress')

      // Descrizione
      cy.contains('Segnala un problema')
        .parent()
        .find('textarea')
        .type('Descrizione dettagliata del problema creato da Cypress E2E')

      // Bottone Segnala
      cy.contains('Segnala un problema')
        .parent()
        .find('button')
        .contains('Segnala')
        .click()

      // Il problema deve apparire nella lista
      cy.contains('Problema test Cypress').should('be.visible')
    })
  })
})