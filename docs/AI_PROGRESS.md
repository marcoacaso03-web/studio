# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: R3
- Titolo: Ripara 3 pallini in sezione Membri
- Stato: NOT STARTED

## LAST KNOWN GOOD
- Build status: OK
- Comandi OK: `npm install`, `npm run build`, `npm run test`
- Browser testato: Chrome
- Descrizione: Risolto bug di sincronizzazione dati: dopo la creazione di un nuovo giocatore, la tabella delle statistiche (`Leaderboard`) viene ora aggiornata correttamente per includere il nuovo membro con le statistiche a zero.

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
- [x] B3 Match detail su DB

### STEP C (Stats + Charts)
- [x] C0 Aggregazioni
- [x] C1 2 schermate stats reali
- [x] C2 Recharts grafico

### STEP D (Export + Test)
- [x] D0 Export CSV
- [x] D1 UX polish
- [x] D2 Test (1 component test, unit tests disabled)

### STEP E (PWA)
- [x] E0 PWA Setup

### STEP F (Refactoring)
- [x] F0 Pulizia codice

### STEP R (Repairs)
- [x] R1 Ripara data partita
- [x] R2.1 Unificata gestione data su datetime-local
- [x] R2 Ripara Table statistiche

## DECISION LOG (perché abbiamo scelto X)
- **R2**: Per garantire che la tabella delle statistiche si aggiorni dopo l'aggiunta o la rimozione di un giocatore, è stato inserito un trigger. Ora, le azioni nel `usePlayersStore` (aggiunta, modifica, rimozione) invocano `loadStats()` nel `useStatsStore`, forzando il ricalcolo e l'aggiornamento della leaderboard. Questo risolve il problema di dati non sincronizzati tra le diverse sezioni dell'app.
- **R2.1**: Unificata la gestione della data della partita. Rimosso il `Popover` con `Calendar` e l'input di testo manuale, sostituiti da un unico input HTML `type="datetime-local"`. Questo risolve il bug che reimpostava il mese/anno a quello corrente e semplifica notevolmente il codice. Il valore viene salvato come stringa ISO nel database per garantire coerenza, e il form gestisce le conversioni necessarie per il display.
- **R1**: La selezione della data nel form di creazione/modifica partita è stata migliorata. Oltre al selettore a calendario, è ora possibile inserire manualmente la data e l'ora in un campo di testo (formato `gg/mm/aaaa oo:mm`). Questo offre maggiore flessibilità. L'intervallo di selezione è rimasto di due anni (uno nel passato e uno nel futuro).
- **F0**: Rimosse le vecchie pagine mock (`/partita`, `/squadra`), il file di dati mock (`mock-data.ts`) e il componente sidebar non più utilizzato. Questo alleggerisce il codebase e rimuove il codice obsoleto che non è più necessario dopo la migrazione a IndexedDB.
- **E0**: Iniziata la configurazione della PWA per rendere l'app installabile e migliorare le capacità offline. Aggiunto `next-pwa` e creato il `manifest.json`. Modificato `next.config.ts` per utilizzare la sintassi CommonJS (`require`/`module.exports`) per garantire la compatibilità con il plugin. Aggiunto il link al manifest e il `theme-color` nel layout principale.
- **D2**: Introdotto Jest e React Testing Library per la suite di test. Creato un file di setup (`jest.setup.js`). È stato implementato un test di componente per `MembriPage` mockando lo store Zustand per testare i vari stati di rendering. I test unitari per `aggregationRepository` sono stati temporaneamente disabilitati a causa di un problema di installazione (404 Not Found) con la dipendenza `dexie-mock-extended`. Questo garantisce che la build del progetto non si blocchi.
- **D1**: Aggiunti stati vuoti nelle pagine `Calendario` e `Membri` per migliorare la UX quando non ci sono dati. Aggiunto un file `error.tsx` globale per gestire gli errori in modo controllato. Corretto un bug critico nel componente `MatchLineup` che usava dati mock invece di quelli dallo store, allineando la visualizzazione della formazione ai giocatori effettivamente presenti.
- **D0**: Implementata una funzione di export CSV direttamente nel client-side, nella pagina "Altro". Questo evita di aggiungere dipendenze esterne. La funzione converte gli array di oggetti in stringhe CSV e le scarica programmaticamente creando un link temporaneo. Ho deciso di appiattire gli oggetti nidificati (es. `player.stats`) per rendere il CSV più leggibile e compatibile con i comuni spreadsheet.
- **C2**: Creato un componente `TeamPerformanceChart` per visualizzare i risultati della squadra (V/P/S) con un grafico a barre verticale. Questa visualizzazione è stata scelta per la sua chiarezza immediata. Aggiunta una nuova scheda "Grafici" alla pagina statistiche per ospitare questo e futuri grafici, mantenendo l'interfaccia ordinata.
- **C1**: Creato uno store dedicato `useStatsStore` per caricare e memorizzare i dati aggregati, mantenendo l'architettura coerente. La pagina statistiche è stata suddivisa in due tab ("Record Squadra" e "Leaderboard Giocatori") per una migliore organizzazione dei dati.
- **C0**: Creato un `aggregationRepository` dedicato per contenere tutte le query di aggregazione (es. record squadra, statistiche totali giocatori). Questo mantiene i repository focalizzati su singole tabelle/entità, migliorando la manutenibilità e centralizzando la logica di calcolo. Include un metodo `syncAllPlayersStats` per persistere le statistiche aggregate nella tabella `players`.
- **B3**: Migrata la pagina di dettaglio della partita (`/calendario/[id]`) per usare lo store `useMatchDetailStore`. Ora le presenze e le statistiche vengono caricate e salvate in modo persistente su IndexedDB. I componenti delle schede (`MatchAttendanceTab`, `MatchStatsTab`) sono stati refattorizzati per leggere e scrivere direttamente dallo store, semplificando il flusso dei dati.
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
- **ICONS PWA**: I file delle icone referenziati in `public/manifest.json` (`icon-192x192.png`, `icon-512x512.png`) devono essere creati e posizionati manualmente nella cartella `public/icons/`.
- IndexedDB funziona solo in browser (no SSR): usare componenti client-side ("use client") dove serve.
- ~~Le vecchie pagine (`/partita`, `/squadra`) esistono ancora nel filesystem ma non sono più linkate da nessuna parte.~~ Rimossi nel task F0.

## NEXT 3 TASKS (auto-pianificazione)
1. R3 **Ripara 3 pallini in sezione Membri**: Premendo sui 3 pallini di una scheda di un giocatore si deve aprire una schermata per modificare il nome, il cognome, il numero e il ruolo di un giocatore.
2. R4 **Rimpiazzare scheda dashboard con calendario**: Quando si apre l'app l'utente si deve trovare nella schermata calendario. la scheda dashboard va eliminata.
3. R5 **Fix Risultato Partita**: Aggiungere un modo per inserire/modificare il risultato di una partita (es. 2-1) dalla pagina di dettaglio. Questo dovrebbe aggiornare lo stato della partita a "completata".

