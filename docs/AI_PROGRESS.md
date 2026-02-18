# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: R8
- Titolo: Refactoring Scheda Partita
- Stato: COMPLETED

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: Riorganizzata la pagina dettaglio partita con risultato in evidenza e nuovi tab Eventi/Squadra. Aggiunta funzione di seeding dati di esempio.

## TASK BOARD STATUS
### STEP R (Repairs & UX)
- [x] R1 Ripara data partita
- [x] R2.1 Unificata gestione data su datetime-local
- [x] R2 Ripara Table statistiche
- [x] R3 Ripara 3 pallini in sezione Membri
- [x] R4 Redirect home a calendario
- [x] R5 Fix Risultato Partita
- [x] R6 Verifica funzionalità di modifica nella schermata calendario
- [x] R7 Riparare Schermata membri
- [x] R8 Refactoring Scheda Partita (Risultato + Tab Eventi/Squadra)

## DECISION LOG
- **R8**: Per migliorare la leggibilità, il risultato della partita è stato spostato in un componente Hero colorato (`primary`) in cima alla pagina. I tab sono stati ridotti a due ("Cronaca & Eventi" e "Formazione & Squadra") per semplificare la navigazione. La cronaca viene generata dinamicamente dalle statistiche inserite (gol/cartellini). Aggiunto pulsante "Esempio" nella pagina calendario per caricare dati di test se il DB è vuoto.

## NEXT 3 TASKS
1. F1 **Pulizia finale e ottimizzazione**: Revisione generale del codice.
2. **Export avanzato**: Aggiunta possibilità di esportare PDF della formazione.
3. **PWA Offline Robustness**: Test di installazione e persistenza asset.
