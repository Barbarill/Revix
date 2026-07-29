# 🔧 Revix

**Revix** è una piattaforma community per la segnalazione e risoluzione di problemi automobilistici. Gli utenti possono cercare la propria auto, segnalare problemi tecnici, confermare le segnalazioni di altri utenti e proporre soluzioni con link ai ricambi. I meccanici possono registrarsi come professionisti verificati e contribuire con soluzioni qualificate.

---

## Funzionalità principali

- **Catalogo auto** — sfoglia per marca con loghi, filtra per modello e anno
- **Problemi** — segnala problemi per categoria (Motore, Freni, Elettronica, Sospensioni, Carrozzeria), conferma le segnalazioni di altri utenti; a 5 conferme il problema diventa ufficiale
- **Soluzioni** — proponi soluzioni con link al ricambio, metti like alle soluzioni migliori
- **Community** — feed globale delle segnalazioni recenti, filtrabile per categoria e ordinabile per data o conferme
- **Officine** — lista meccanici verificati sulla piattaforma, ricercabili per città
- **Ricambi** — aggregatore dei link ricambi inseriti nelle soluzioni, filtrabili per categoria
- **Notifiche** — notifica in-app quando qualcuno conferma un tuo problema
- **Profili utente** — profilo pubblico con statistiche, profilo meccanico con dati officina
- **Ricerca fulltext** — barra di ricerca globale su auto e problemi

---

## Stack tecnologico

### Backend
| Tecnologia | Utilizzo |
|---|---|
| **Node.js** | Runtime server |
| **Express** | Framework HTTP e routing |
| **TypeScript** | Tipizzazione statica |
| **Prisma ORM** | Accesso al database con type-safety |
| **PostgreSQL** | Database relazionale |
| **JSON Web Token (JWT)** | Autenticazione stateless |
| **bcrypt** | Hashing delle password |
| **Zod** | Validazione degli input |
| **dotenv** | Gestione variabili d'ambiente |

### Frontend
| Tecnologia | Utilizzo |
|---|---|
| **React 18** | UI library |
| **TypeScript** | Tipizzazione statica |
| **Vite** | Build tool e dev server |
| **React Router v6** | Routing client-side |
| **TanStack Query** | Fetching, caching e sincronizzazione dati |
| **Axios** | Client HTTP |
| **simple-icons** | Loghi marche automobilistiche SVG |

### Testing
| Tecnologia | Utilizzo |
|---|---|
| **Jest** | Test runner per il backend |
| **Supertest** | Test HTTP delle route Express |
| **Cypress** | Test end-to-end |

---

## Struttura del progetto

```
Revix/
├── server/                  # Backend Node.js/Express
│   ├── src/
│   │   ├── routes/          # auth, cars, problems, solutions, users, search, notifications
│   │   ├── middleware/      # authMiddleware (JWT)
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Schema database
│   │   └── seed.ts          # Dati iniziali (auto)
│   └── src/__tests__/       # Test Jest + Supertest
│
└── client/                  # Frontend React/Vite
    ├── src/
    │   ├── pages/           # Home, CarDetail, Community, Officine, Ricambi, Profile...
    │   ├── components/      # Navbar, CarCard, ProblemList, SolutionList...
    │   ├── hooks/           # useAuth
    │   └── services/        # api.ts (Axios)
    └── public/
        └── logos/           # Loghi SVG marche (file locali)
```

---

## Modello dati (Prisma)

- **User** — utenti normali e meccanici (`role: USER | MECHANIC`), con campi officina e verifica
- **Car** — catalogo auto con marca, modello, anni, carburante, CV
- **Problem** — segnalazione legata a un'auto e un utente, con categoria e conteggio conferme
- **Confirm** — relazione many-to-many tra utenti e problemi confermati
- **Solution** — soluzione a un problema, con link ricambio e conteggio like
- **Like** — relazione many-to-many tra utenti e soluzioni
- **Notification** — notifica automatica al proprietario del problema alla conferma

---

## Avvio in locale

### Prerequisiti
- Node.js 18+
- PostgreSQL

## Copertura test

- **41 test** Jest + Supertest su 7 file (`auth`, `cars`, `problems`, `solutions`, `search`, `notifications`, `users`)
- **Coverage: ~80%** delle righe del backend
- **Test Cypress E2E** per flusso autenticazione e segnalazione problema