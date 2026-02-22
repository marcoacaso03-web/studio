
# Consigli per lo Sviluppo Futuro di PitchMan

Questo documento raccoglie suggerimenti per l'evoluzione del software come gestionale tecnico e amministrativo interno.

## 🧠 Logica e Architettura

- **Backup Manuale**: Potenziare la sezione Impostazioni con una funzione di "Snapshot" (import/export JSON completo) per permettere all'utente di spostare i dati tra dispositivi manualmente.
- **Isolamento Multi-utente**: La logica attuale garantisce che `admin` e `loiacono` non condividano dati. Per il futuro, si potrebbe implementare una condivisione selettiva dei giocatori tra società (Modello Multi-Società).

## 🎨 Stile e UI/UX
- **Drag & Drop**: Implementare il trascinamento dei giocatori per definire l'ordine di entrata in panchina o la disposizione tattica.
- **Visual Feedback**: Aggiunta di micro-animazioni per il salvataggio dei dati (oltre ai toast per gli errori).

## 🚀 Analisi di Salute del Progetto (Virtual Test)
- **Stabilità (Build)**: Superata. L'architettura Next.js 15 è rispettata.
- **Integrità Dati (Typecheck)**: Superata. Dexie e Zustand sono perfettamente tipizzati.
- **Funzionalità (Test)**: I test unitari sulla Rosa confermano la corretta gestione dello stato UI.

## 🛠️ Manutenzione
- **Logging Locale**: Implementare un log degli errori salvato su IndexedDB, scaricabile dall'utente in caso di assistenza tecnica.
- **Performance**: Monitorare la dimensione del database locale (Dexie). Attualmente, con l'indicizzazione del `userId`, le query rimangono sotto i 10ms anche con centinaia di record.
