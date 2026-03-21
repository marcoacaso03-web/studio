# PitchMan - Struttura del Progetto

Questo documento descrive sinteticamente tutti i file del progetto per facilitarne la navigazione.

## File di Configurazione Principali
- `.firebaserc` / `apphosting.yaml` / `firestore.rules`: Configurazioni per il deploy e le regole di sicurezza del database Firebase.
- `package.json` / `package-lock.json` / `components.json`: Gestione delle dipendenze npm e dei componenti UI (Shadcn).
- `next.config.ts` / `tailwind.config.ts` / `tsconfig.json` / `postcss.config.mjs`: File di configurazione di Next.js, Tailwind CSS e TypeScript.
- `jest.config.js` / `jest.setup.js`: Configurazione e setup automatico per i test (Jest).
- `next-env.d.ts`: Dichiarazioni TypeScript auto-generate da Next.js.
- `temp_files_list.txt`: File generato temporaneamente per elencare la struttura.

## Root & Assets (public, docs)
- `docs/backend.json` / `docs/README.md`: Documentazione del progetto (questo file e le API).
- `public/manifest.json` / `public/favicon-16x16.png`: File per il supporto PWA (Progressive Web App) e le icone per i browser.

## Pagine dell'Applicazione (src/app)
- `layout.tsx` / `page.tsx` / `globals.css`: Il contenitore di base di tutte le pagine, la pagina iniziale (Dashboard) e i file CSS globali.
- `error.tsx`: Pagina di fallback universale per gestire gli errori Next.js non previsti senza crashare l'app.
- `allenamento/`: Root per le pagine web che mostrano le sessioni e i report di allenamento.
- `altro/`: Sezione per impostazioni addizionali dell'app.
- `calendario/`: Pagine dedicate a mostrare gli eventi previsti e il calendario stagionale.
- `login/`: Schermata di autenticazione per accedere al sistema.
- `membri/`: Dashboard di gestione della rosa dei giocatori.
- `scout/`: Pagine per monitorare prestazioni o inserire dati per i giocatori e squadre avversarie.
- `statistiche/`: Dashboard ad alto livello per visionare tiri, vittorie e grafici della stagione in corso.

## Intelligenza Artificiale (src/ai)
- `dev.ts` / `genkit.ts`: Inizializzano il server Google Genkit per l'uso dei modelli generativi AI.
- `flows/...`: Prompt e workflow AI specifici per generare le macro operazioni (esportare/importare formazioni, etc).

## Componenti UI - (src/components)
**1. Layout e Genarali (`layout/` & Root)**
- `FirebaseErrorListener.tsx`: Rileva e mostra gli errori del database a tutte le pagine in un Toast.
- `app-header-wrapper.tsx` / `bottom-nav.tsx` / ecc.: Le varie barre di navigazione (in alto e in fondo) e i temi (Dark Mode).

**2. Entità Singole (`allenamento/`, `giocatori/`, `partite/`, `scout/`, `squadra/`)**
Queste cartelle contengono finestre di dialogo (Es. `player-form-dialog.tsx`), schede specifiche, form e tabelle per gestire le rispettive funzioni (aggiungere formazioni, referti partita, visualizzare un giocatore singolo).

**3. Statistiche (`statistiche/`)**
- Raggruppa tutti i componenti basati sulla libreria Recharts (es. `goal-venue-charts.tsx`, `team-performance-chart.tsx`) per disegnare i grafici della dashboard.

**4. Componenti UI Atomici (`ui/`)**
- Contiene decine di file (es. `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`).
- Sono blocchi di codice UI base e riciclabili installati tramite Shadcn UI, non richiedono generalmente di essere toccati.

## Database & Servizi (src/firebase & src/lib)
- `src/firebase/...`: Inizializzazione del client Firebase e dei Context di React per diffondere lo stato di connessione a tutta l'app.
- `src/firebase/firestore/...`: Hook custom (`use-collection`, `use-doc`) per scaricare i dati da Firestore in tempo reale.
- `src/lib/types.ts` / `src/lib/utils.ts`: Tipi TypeScript strutturali per l'autocompletamento e utility per i CSS.
- `src/lib/db.ts`: Gestore per il database off-line locale dell'app tramite IndexedDB.
- `src/lib/repositories/...`: Sono i "Repository Pattern". I file qui contengono le query CRUD per ciascun dominio (partite, statistiche, allenamenti). Separano la vista dal codice logico del DB.

## Gestione Stato App (src/store)
- `src/store/...`: Usa "Zustand" per gestire lo Stato Globale su RAM. Ad esempio conserva la lista giocatori scaricata e la sessione utente (`useAuthStore`, `usePlayersStore`) per evitare ricaricamenti.