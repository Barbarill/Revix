describe('E2E-NAV-01/02/03: Navigazione pagine principali', () => {
  it('E2E-NAV-01: Community è raggiungibile e mostra segnalazioni', () => {
    cy.visit('/')
    cy.contains('Community').click()
    cy.url().should('include', '/community')
    cy.contains('segnalazioni').should('be.visible')
  })

  it('E2E-NAV-02: Officine è raggiungibile e mostra la barra di ricerca', () => {
    cy.visit('/')
    cy.contains('Officine').click()
    cy.url().should('include', '/officine')
    cy.contains('Meccanici').should('be.visible')
  })

  it('E2E-NAV-03: Ricambi è raggiungibile e mostra i filtri categoria', () => {
    cy.visit('/')
    cy.contains('Ricambi').click()
    cy.url().should('include', '/ricambi')
    cy.contains('Tutti').should('be.visible')
  })

  it('E2E-NAV-04: cliccando una marca in Home si filtrano i modelli', () => {
    cy.visit('/')
    cy.contains('Sfoglia per marca').should('be.visible')

    cy.contains('Sfoglia per marca')
      .parent()
      .find('button')
      .filter(':contains("Fiat")')
      .first()
      .click({ force: true })

    cy.contains('← Tutte le marche').should('be.visible')
    cy.contains('Panda').should('be.visible')
  })
})