# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: A3
- Titolo: Calendario CRUD mock
- Stato: NOT STARTED

## LAST KNOWN GOOD
- Build status: OK
- Comandi OK: `npm run build`
- Browser testato: Chrome
- Descrizione: Applicato il design system di base. Aggiornata la palette colori in `globals.css` per usare il blu primario (#1A237E), il grigio di sfondo (#F5F5F5) e l'arancione come accento (#FF8F00). Rimosso un override del font per applicare correttamente 'PT Sans' su tutto il corpo dell'applicazione, come da specifiche. L'interfaccia ora ha un aspetto più coerente.

## TASK BOARD STATUS
### STEP A (UI + Mock)
- [x] A0 Bootstrap
- [x] A1 Routing + Shell
- [x] A2 Design system
- [ ] A3 Calendario CRUD mock
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
1. A3 - Calendario: implementare il CRUD in memoria per le partite.
2. A4 - Membri: implementare il CRUD in memoria per i giocatori.
3. A5 - Dettaglio Partita: implementare la gestione delle presenze, statistiche e formazione (mock).
