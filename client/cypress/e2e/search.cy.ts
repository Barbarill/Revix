describe('E2E-SEARCH-01/02: Ricerca fulltext', () => {
  it('E2E-SEARCH-01: cerca "Fiat" e mostra risultati nella dropdown', () => {
    cy.visit('/')

    cy.get('input[placeholder*="Cerca"]').first().type('Fiat')

    cy.contains('Fiat').should('be.visible')
  })

  it('E2E-SEARCH-02: cerca un termine inesistente e non mostra risultati', () => {
    cy.visit('/')

    cy.get('input[placeholder*="Cerca"]').first().type('xyznonexistent')

    cy.contains('Nessun risultato').should('be.visible')
  })
})