# PitchMan - Struttura del Progetto

Questo documento descrive sinteticamente tutti i file del progetto per facilitarne la navigazione.

## File di Configurazione Principali
- `.firebaserc` / `apphosting.yaml` / `firestore.rules`: Configurazioni per il deploy e le regole di sicurezza del database Firebase.
- `package.json` / `package-lock.json` / `components.json`: Gestione delle dipendenze npm e dei componenti UI (Shadcn).
- `next.config.ts` / `tailwind.config.ts` / `tsconfig.json` / `postcss.config.mjs`: File di configurazione di Next.js, Tailwind CSS e TypeScript.
- `jest.config.js` / `jest.setup.js`: Configurazione e setup automatico per i test (Jest).
- `next-env.d.ts`: Dichiarazioni TypeScript auto-generate da Next.js.
- `temp_files_list_utf8.txt`: File generato temporaneamente per elencare la struttura.

## Root & Assets (public, docs)
- `docs/`: Documentazione dettagliata (PROJECTS.md, Pages.md, Stili.md, backend.json).
- `public/`: Manifest per PWA, favicon, icone e asset statici.

## Pagine dell'Applicazione (src/app)
- `layout.tsx` / `page.tsx` / `globals.css`: Layout base con provider, Splash screen (Dashboard) e stili globali.
- `error.tsx`: Pagina di fallback universale per la gestione degli errori.
- `allenamento/`: Root per sessioni, report di allenamento e `libreria/` degli esercizi.
- `altro/`: Impostazioni app, gestione squadra, profilo coach e debug/reset dati.
- `calendario/`: Dashboard principale con vista cronologica delle partite (`[id]` per il dettaglio).
- `login/`: Schermata di autenticazione Firebase.
- `membri/`: Gestione della rosa giocatori, `confronto/` tra giocatori e `[id]` per la scheda tecnica singola.
- `scout/`: Scouting di talenti e gestione categorie di osservazione.
- `statistiche/`: Dashboard analitica con grafici Recharts su performance, gol e record.

## Intelligenza Artificiale (src/ai)
- `dev.ts` / `genkit.ts`: Inizializzazione Google Genkit per modelli Gemini.
- `flows/`: Prompt e workflow AI per importazione formazioni (Tuttocampo), generazione formazioni e analisi.

## Componenti UI - (src/components)
- `layout/`: Componenti strutturali (`app-header`, `bottom-nav`, `auth-guard`, `theme-provider`).
- `allenamento/`, `giocatori/`, `partite/`, `scout/`, `squadra/`: Dialog specifici (es. `match-form-dialog`, `player-form-dialog`), card e form di inserimento dati.
- `statistiche/`: Componenti Recharts per i grafici della dashboard.
- `ui/`: Componenti atomici di base installati via Shadcn UI (Button, Card, Dialog, Input, ecc.).
- `FirebaseErrorListener.tsx`: Listener globale per la visualizzazione di errori dal database via Toast.

## Database & Servizi (src/firebase, src/lib, src/hooks, src/types)
- `src/firebase/`: Inizializzazione SDK, provider di contesto, gestione errori e login non-blocking.
- `src/firebase/firestore/`: Hook custom (`use-collection`, `use-doc`) per dati real-time.
- `src/lib/repositories/`: Logica CRUD e query Firestore organizzate per dominio (Repository Pattern). Implementa anche la logica di condivisione stagioni via codici.
- `src/lib/db.ts`: Gestione database locale IndexedDB via Dexie per cache e persistenza.
- `src/lib/utils.ts`: Utility per classi CSS dinamiche (clsx, tailwind-merge).
- `src/hooks/`: Hook React riutilizzabili (es. `use-toast`).
- `src/types/`: Definizioni di tipi TypeScript globali o di terze parti.

## Gestione Stato App (src/store)
- Usa **Zustand** per lo stato globale reattivo:
  - `useAuthStore`: Stato sessione utente e stagione attiva.
  - `usePlayersStore`, `useMatchesStore`, `useTrainingStore`: Cache dei dati scaricati per minimizzare le letture Firestore.
  - `useThemeStore`: Gestione tema Dark/Light.
  - `useAppStore`, `useSettingsStore`: Stato UI e preferenze utente.