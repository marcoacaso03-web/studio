
# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: Squadra+
- Target: Web (PWA) — Offline-only
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)

## CURRENT TASK
- ID: R18
- Titolo: Tabella Rosa e Ridenominazione
- Stato: COMPLETED

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: La sezione 'Membri' è stata rinominata in 'Rosa'. I giocatori sono ora visualizzati in una tabella dettagliata con colonne per Nome, Cognome, Ruolo e statistiche (Presenze, Min/Gara, Gol, Assist).

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
- [x] R18 Tabella Rosa e Ridenominazione

## DECISION LOG
- **R18**: La visualizzazione a schede della rosa è stata sostituita da una tabella per una gestione più efficiente dei dati statistici. La colonna 'Minuti per partita' è stata aggiunta come segnaposto per sviluppi futuri.

## NEXT 3 TASKS
1. F1 **Pulizia finale e ottimizzazione**: Revisione generale del codice.
2. **Export avanzato**: Aggiunta possibilità di esportare PDF della formazione.
3. **PWA Offline Robustness**: Test di installazione e persistenza asset.
