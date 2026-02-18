
# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: R17
- Titolo: Automazione Risultato da Cronaca
- Stato: COMPLETED

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: Rimosso input manuale del risultato dal form di modifica. Il punteggio ora si aggiorna automaticamente aggiungendo/rimuovendo gol nella cronaca.

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
- [x] R16 Fix UI Freeze dopo Modifica Partita
- [x] R17 Automazione Risultato da Cronaca

## DECISION LOG
- **R17**: Il risultato della partita non è più editabile manualmente. Lo store ricalcola `match.result` ogni volta che un evento di tipo `goal` viene aggiunto o rimosso dalla cronaca.

## NEXT 3 TASKS
1. F1 **Pulizia finale e ottimizzazione**: Revisione generale del codice.
2. **Export avanzato**: Aggiunta possibilità di esportare PDF della formazione.
3. **PWA Offline Robustness**: Test di installazione e persistenza asset.
