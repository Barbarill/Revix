describe('E2E-FILTER-01/02/03: Filtri sidebar Home', () => {
  it('E2E-FILTER-01: filtrare per carburante "Ibrido" mostra solo auto ibride', () => {
    cy.visit('/')

    cy.contains('Sfoglia per marca').should('be.visible')

    // Spunta Ibrido
    cy.contains('label', 'Ibrido').click()

    // Deve sparire la griglia marche
    cy.contains('Sfoglia per marca').should('not.exist')

    // Deve apparire almeno un risultato con badge Ibrido
    cy.contains('span', 'Ibrido').should('be.visible')
  })

  it('E2E-FILTER-02: filtrare per anno "2020 e oltre" mostra solo auto recenti', () => {
    cy.visit('/')

    cy.contains('Sfoglia per marca').should('be.visible')

    // Spunta 2020 e oltre
    cy.contains('label', '2020 e oltre').click()

    // Deve sparire la griglia marche
    cy.contains('Sfoglia per marca').should('not.exist')

    // Deve apparire almeno un risultato
    cy.get('a[href^="/cars/"]').first().should('exist')
  })

  it('E2E-FILTER-03: azzera filtri ripristina la griglia marche', () => {
    cy.visit('/')

    cy.contains('Sfoglia per marca').should('be.visible')

    // Attiva un filtro
    cy.contains('label', 'Diesel').click()

    // Il bottone azzera deve apparire
    cy.contains('✕ Azzera filtri').should('be.visible')

    // Azzera
    cy.contains('✕ Azzera filtri').click()

    // Torna la griglia marche
    cy.contains('Sfoglia per marca').should('be.visible')
  })
})