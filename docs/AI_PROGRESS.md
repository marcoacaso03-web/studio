
# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: R11
- Titolo: Rimozione ridondanza Convocazioni
- Stato: COMPLETED

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: Rimossa la tab Convocazioni (presente/assente) e unificata la logica delle presenze con la Formazione (Lineup). Le statistiche ora si basano sui giocatori inseriti in distinta.

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

## DECISION LOG
- **R11**: Rimossa la gestione manuale "Convocati" (presente/assente) in quanto ridondante rispetto alla formazione. La presenza è ora implicitamente determinata dall'inclusione nella distinta (11+9).

## NEXT 3 TASKS
1. F1 **Pulizia finale e ottimizzazione**: Revisione generale del codice.
2. **Export avanzato**: Aggiunta possibilità di esportare PDF della formazione.
3. **PWA Offline Robustness**: Test di installazione e persistenza asset.
