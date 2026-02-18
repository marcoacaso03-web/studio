
# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: R15
- Titolo: Ordinamento Cronologico Decrescente Eventi
- Stato: COMPLETED

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: Ordinata la cronaca eventi in modo decrescente (eventi più recenti in alto).

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
- [x] R9 Fix SchemaError (Status non indicizzato)
- [x] R10 Estensione riserve a 20
- [x] R11 Rimozione ridondanza Convocazioni
- [x] R12 Selezione esclusiva in Formazione
- [x] R13 Cronaca Eventi e Inserimento Rapido
- [x] R14 Perfezionamento Inserimento Eventi (Tempi e Minuti)
- [x] R15 Ordinamento Cronologico Decrescente Eventi

## DECISION LOG
- **R13**: Eliminata la tabella statistiche manuale in favore di una Timeline eventi (Goal, Assist, Cartellini).
- **R14**: Modificati i tempi di gioco per supportare i supplementari (1TS, 2TS) e rimosso il tempo di recupero generico.
- **R15**: Implementato ordinamento decrescente nel repository eventi per migliorare la leggibilità della cronaca.

## NEXT 3 TASKS
1. F1 **Pulizia finale e ottimizzazione**: Revisione generale del codice.
2. **Export avanzato**: Aggiunta possibilità di esportare PDF della formazione.
3. **PWA Offline Robustness**: Test di installazione e persistenza asset.
