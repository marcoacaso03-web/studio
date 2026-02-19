
# Consigli per lo Sviluppo Futuro di PitchMan

Questo documento raccoglie suggerimenti per l'evoluzione del software come gestionale tecnico e amministrativo interno.

## 🧠 Logica e Architettura
- **Multi-Stagione**: Implementare un sistema di archiviazione per separare i dati delle diverse stagioni sportive senza perderne lo storico.
- **Backup Manuale**: Potenziare la sezione Impostazioni con una funzione di "Snapshot" (import/export JSON completo) per permettere all'utente di spostare i dati tra dispositivi manualmente.

## 🎨 Stile e UI/UX
- Aggiornamento con icone personalizzate
- **Drag & Drop**: Implementare il trascinamento dei giocatori per definire l'ordine di entrata in panchina o la disposizione tattica.

## 🚀 Funzionalità Gestionali (Focus Interno)
- **Note Tattiche**: Sezione dedicata all'inserimento di annotazioni testuali post-partita per analizzare i punti deboli dell'avversario o progressi tecnici dei singoli.
- **Gestione Infortuni**: Storico medico degli infortuni per giocatore, con calcolo automatico dei giorni di indisponibilità.

## 🛠️ Manutenzione
- **Logging Locale**: Implementare un log degli errori salvato su IndexedDB, scaricabile dall'utente in caso di assistenza tecnica.
- **Performance**: Monitorare la dimensione del database locale (Dexie) e implementare funzioni di pulizia automatica per i log molto vecchi.
