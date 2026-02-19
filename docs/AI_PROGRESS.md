
# AI_PROGRESS — Allenatore Calcio Offline (Next.js)

## PROJECT SNAPSHOT
- Nome progetto: PitchMan
- Target: Gestionale interno per singoli allenatori o società (Uso Personale)
- Natura: 100% Offline-only (No Cloud, No Social)
- Stack: Next.js (App Router) + TypeScript + Dexie (IndexedDB) + Zustand + Zod + Recharts
- Lingua UI: it-IT (date e formati italiani)
- Tema: Deep Blue (#1A237E) & Accent Orange (#FF8F00)

## CURRENT TASK
- ID: F2
- Titolo: Revisione strategica documentazione
- Stato: COMPLETED

## LONG-TERM STRATEGY (Blueprint)
- **Sincronizzazione Cloud & Multi-device**: Da valutare solo per architetture enterprise centralizzate (non priorità per uso personale).
- **Conflict Resolution**: Gestione integrità dati in scenari di import/export massivo.
- **Modello Multi-Società**: Evoluzione verso una struttura gerarchica per gestire più squadre sotto un'unica entità gestionale.

## LAST KNOWN GOOD
- Build status: OK
- Descrizione: Applicazione ottimizzata e pulita. Logica di calcolo dei minuti integrata nella cronaca. Visualizzazione Rosa compatta. Dashboard rapida con eliminazione immediata. Tema cromatico coerente Blu/Arancio.

## TASK BOARD STATUS
### STEP R (Repairs & UX)
- [x] R1-R23 Riparazioni e perfezionamento UI/UX (Completato)

### STEP F (Finalize)
- [x] F1 Pulizia finale e ottimizzazione codice
- [x] F2 Revisione strategica Blueprint e Consigli.md

## DECISION LOG
- **Uso Personale**: L'app è intesa come strumento di lavoro individuale. Le funzioni social sono rimosse dal perimetro per mantenere il focus sulla gestione dati pura.
- **Offline First**: La persistenza è locale per garantire velocità e privacy totale dei dati sensibili degli atleti.
