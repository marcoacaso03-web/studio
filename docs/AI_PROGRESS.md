# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: A4
- Titolo: Membri CRUD mock
- Stato: NOT STARTED

## LAST KNOWN GOOD
- Build status: OK
- Comandi OK: `npm run build`
- Browser testato: Chrome
- Descrizione: Implementato il CRUD in memoria per le partite. L'utente può ora aggiungere, modificare ed eliminare partite tramite una dialog form. Le modifiche sono persistite in memoria e riflesse nell'interfaccia utente. Aggiunto feedback tramite toasts.

## TASK BOARD STATUS
### STEP A (UI + Mock)
- [x] A0 Bootstrap
- [x] A1 Routing + Shell
- [x] A2 Design system
- [x] A3 Calendario CRUD mock
- [ ] A4 Membri CRUD mock
- [ ] A5 Match detail mock (presenze/stats/formazione)

### STEP B (IndexedDB Dexie)
- [ ] B0 Setup Dexie + schema
- [ ] B1 Repos + stores
- [ ] B2 UI su DB (Calendario/Membri)
- [ ] B3 Match detail su DB

### STEP C (Stats + Charts)
- [ ] C0 Aggregazioni
- [ ] C1 2 schermate stats reali
- [ ] C2 Recharts grafico

### STEP D (Export + Test)
- [ ] D0 Export CSV
- [ ] D1 UX polish
- [ ] D2 Test (2 unit + 1 component)

## DECISION LOG (perché abbiamo scelto X)
- **A3**: Utilizzato `useState` per la gestione dello stato locale della pagina `calendario`, rimandando l'introduzione di Zustand per mantenere l'incrementalità.
- **A3**: Creato un componente `MatchFormDialog` riutilizzabile per l'inserimento e la modifica, usando `react-hook-form` e `zod` per la validazione.
- **A3**: Le funzioni CRUD (`addMatch`, `updateMatch`, `deleteMatch`) sono state aggiunte in `mock-data.ts` per simulare un data layer modificabile.
- **A3**: Aggiunto `AlertDialog` per la conferma dell'eliminazione per migliorare la UX.
- **A2**: I colori primario, di sfondo e d'accento sono stati impostati in `globals.css` per riflettere le specifiche del design system. Questo garantisce coerenza in tutta l'app.
- **A2**: Il font di default (Arial) è stato rimosso da `globals.css` per permettere a Tailwind di applicare correttamente "PT Sans" come definito nel layout e nella configurazione, garantendo la tipografia richiesta.
- **A1**: La navigazione è stata implementata creando le nuove pagine e aggiornando i link. I vecchi file (`/partita`, `/squadra`) non sono stati eliminati ma sono ora orfani; verranno rimossi in un futuro task di pulizia per mantenere l'incrementalità.
- **A1**: Migliorato il componente Dropdown nella lista partite per essere funzionale, con un link corretto ai dettagli e voci placeholder per future azioni CRUD.
- **A1**: Risolto un potenziale errore di idratazione (hydration mismatch) nella tabella delle statistiche della partita estraendola in un componente client (`"use client"`) che gestisce i dati randomici con `useEffect`.
- **A0**: Creato un layout base mobile-first con bottom navigation per seguire le nuove direttive. La sidebar è stata deprecata per favorire un'esperienza più moderna su mobile.
- **A0**: La struttura delle cartelle (`src/core`, `src/features`, etc.) sarà adottata in modo incrementale a partire dai prossimi task per ridurre la complessità iniziale e mantenere la build stabile.

## RUNBOOK (comandi)
- npm install
- npm run dev
- npm run lint
- npm run test
- npm run build

## NOTES / GOTCHAS
- IndexedDB funziona solo in browser (no SSR): usare componenti client-side ("use client") dove serve.
- PWA offline: service worker + precache asset (configurare con next-pwa o alternativa).
- Le vecchie pagine (`/partita`, `/squadra`) esistono ancora nel filesystem ma non sono più linkate da nessuna parte.

## NEXT 3 TASKS (auto-pianificazione)
1. A4 - Membri: implementare il CRUD in memoria per i giocatori.
2. A5 - Dettaglio Partita: implementare la gestione delle presenze, statistiche e formazione (mock).
3. B0 - Setup Dexie: introdurre Dexie e definire lo schema del database.
