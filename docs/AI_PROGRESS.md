# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: B3
- Titolo: Match detail su DB
- Stato: NOT STARTED

## LAST KNOWN GOOD
- Build status: OK
- Comandi OK: `npm install`, `npm run build`
- Browser testato: Chrome
- Descrizione: Le pagine Calendario e Membri sono state migrate per usare gli store Zustand e il database IndexedDB (Dexie). I dati ora sono persistenti. Anche la dashboard legge dallo store.

## TASK BOARD STATUS
### STEP A (UI + Mock)
- [x] A0 Bootstrap
- [x] A1 Routing + Shell
- [x] A2 Design system
- [x] A3 Calendario CRUD mock
- [x] A4 Membri CRUD mock
- [x] A5 Match detail mock (presenze/stats/formazione)

### STEP B (IndexedDB Dexie)
- [x] B0 Setup Dexie + schema
- [x] B1 Repos + stores
- [x] B2 UI su DB (Calendario/Membri)
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
- **B2**: Convertita la Dashboard (pagina home) a Client Component per poter utilizzare gli store Zustand e mostrare dati dinamici e aggiornati dal database locale (es. numero giocatori, prossima partita).
- **B2**: Le pagine `Calendario` e `Membri` ora utilizzano i rispettivi store (`useMatchesStore`, `usePlayersStore`) per tutte le operazioni CRUD. Questo centralizza la logica di gestione dei dati e li rende persistenti grazie a Dexie.
- **B2**: Aggiunti scheletri di caricamento (Skeleton components) per migliorare la UX durante il fetch iniziale dei dati da IndexedDB, evitando schermate vuote.
- **B1**: Creati repository dedicati (`playerRepository`, `matchRepository`, etc.) per incapsulare le query Dexie.js, mantenendo il codice di accesso ai dati pulito e centralizzato.
- **B1**: Introdotti store Zustand (`usePlayersStore`, `useMatchesStore`, `useMatchDetailStore`) per gestire lo stato dell'applicazione in modo centralizzato e reattivo. Questo semplificherà la sincronizzazione dell'UI con il database IndexedDB.
- **B0**: Aggiunto Dexie.js per la gestione del database IndexedDB. La versione 4 è stabile e offre un'ottima API basata su Promise e type-safety con TypeScript. Lo schema è stato definito in un file dedicato `src/lib/db.ts` per centralizzare la configurazione del DB.
- **A5**: Le schede "Convocati" e "Statistiche" sono state estratte in componenti client dedicati (`MatchAttendanceTab`, `MatchStatsTab`) per incapsulare la logica di stato e l'interattività, mantenendo pulita la pagina principale del dettaglio partita.
- **A5**: Per la gestione delle presenze, è stato usato un `RadioGroup` per permettere i tre stati ('presente', 'assente', 'in dubbio'), offrendo più granularità rispetto a un semplice `Switch`.
- **A5**: La scheda statistiche ora permette l'input numerico e mostra solo i giocatori contrassegnati come "presente", rendendo l'interfaccia più contestuale e utile.
- **A4**: Utilizzato `useState` e un dialog form per il CRUD dei giocatori, mantenendo coerenza con l'implementazione del calendario (A3).
- **A4**: Aggiunto un `DropdownMenu` alla `PlayerCard` per le azioni di modifica ed eliminazione, rendendo l'interfaccia pulita e funzionale.
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
1. B3 - Match detail su DB.
2. C0 - Query aggregazioni (repo).
3. C1 - 2 schermate stats reali.
