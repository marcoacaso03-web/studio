
# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)
- Tema: Deep Blue (#1A237E) & Accent Orange (#FF8F00)

## CURRENT TASK
- ID: F1
- Titolo: Pulizia finale e ottimizzazione
- Stato: COMPLETED

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: Applicazione ottimizzata e pulita. Logica di calcolo dei minuti integrata nella cronaca. Visualizzazione Rosa compatta. Dashboard rapida con eliminazione immediata. Tema cromatico coerente Blu/Arancio.

## TASK BOARD STATUS
### STEP R (Repairs & UX)
- [x] R1-R18 Riparazioni e perfezionamento UI/UX
- [x] R19 Unificazione Gol e Assist (Evento unico)
- [x] R20 Sostituzioni atomiche (Entra/Esce in riga unica)
- [x] R21 Automazione Minuti (Calcolo da durata gara e cambi)
- [x] R22 Refactoring Colori Brand (Blu/Arancio)
- [x] R23 Ottimizzazione Rosa e Dashboard (Visuale compatta)

### STEP F (Finalize)
- [x] F1 Pulizia finale e ottimizzazione codice
- [x] F2 Creazione file Consigli.md per sviluppi futuri

## DECISION LOG
- **Automazione**: Si è deciso di rimuovere l'inserimento manuale delle statistiche individuali a favore di un calcolo automatico basato sulla cronaca, per ridurre il carico di lavoro dell'utente durante la gara.
- **UI Mobile**: La tabella Rosa è stata privata delle statistiche per favorire la velocità di gestione anagrafica, lasciando la consultazione dei dati alla sezione 'Statistiche'.

## NEXT STEPS
1. **Export avanzato**: Aggiunta possibilità di esportare PDF della formazione (Suggerito).
2. **Cloud Sync**: Integrazione con Firebase per multi-device (Suggerito).
