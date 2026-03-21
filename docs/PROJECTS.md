# 🗺️ PitchMan — Roadmap & Miglioramenti

> Documento generato dall'analisi completa del codebase. Ogni voce è concreta e attuabile.

---

## 🔴 Bug & Fix Immediati

- [x] **Icone PWA mancanti** — Il `manifest.json` punta a `/icons/icon-192x192.png` e `/icons/icon-512x512.png` che non esistono. Il terminale logga `GET /icons/icon-192x192.png 404` ad ogni caricamento.
- [x] **Colori manifest obsoleti** — `theme_color: "#21416E"` e `background_color: "#020a1f"` in `manifest.json` e `layout.tsx` non corrispondono più alla nuova palette teal/ardesia.
- [x] **Dark mode tabs Allenamento** — Le tabs in `allenamento/[id]/page.tsx` (riga 93-96) usano ancora `data-[state=active]:bg-white` che non funziona in dark mode (stesso fix già applicato alla pagina partita).
- [x] **Dark mode tabs Statistiche** — Le tabs in `statistiche/page.tsx` non hanno lo stile dark mode per lo stato attivo.
- [x] **Dead code da rimuovere** — 4 file stub che esportano `return null`:
  - `match-attendance-tab.tsx`
  - `match-stats-tab.tsx`
  - `match-result-dialog.tsx`
  - `match-lineup.tsx`

---

## 🟡 Ottimizzazioni

### Performance
- [x] **Lazy load componenti pesanti** — Le pagine `membri` e `calendario` caricano tutto in un colpo. Usare `dynamic()` come già fatto in `statistiche/page.tsx` per i grafici.
- [x] **Debounce ricerca Scout** — L'interfaccia Scout non ha una barra di ricerca testuale, solo filtri per etichetta. Aggiungere una ricerca per nome con debounce.
- [x] **Paginazione giocatori scout** — Con molti giocatori monitorati, il rendering di tutti in griglia potrebbe degradare. Implementare `IntersectionObserver` per infinite scroll.
- [x] **Indici Firestore** — Verificare che le query composta (es. `where('teamOwnerId', '==', ...)`) abbiano indici composti configurati nella console Firebase.

### Sicurezza
- [ ] **Validazione password al signup** — `useAuthStore.ts` non impone requisiti minimi sulla password (lunghezza, complessità). Firebase accetta qualsiasi password ≥6 caratteri ma l'UI non guida l'utente.
- [ ] **Chiave API nel `.env` locale** — La `GOOGLE_GENAI_API_KEY` è esposta lato client in `genkit.ts` (chiamate server-side). Verificare che non venga mai esposta nel bundle client aggiungendo il prefisso `_` o spostandola su variabili server-only.
- [ ] **Firestore Rules** — Rivedere `firestore.rules` per assicurarsi che ogni utente possa accedere solo ai propri dati e non a quelli di altri `teamOwnerId`.

### Codice
- [x] **Font family hardcoded** — `layout.tsx` carica "PT Sans" da Google Fonts. Considerare `next/font/google` per ottimizzazione automatica e preload, evitando FOUT.
- [x] **Tipo `any` nello Scout** — `scout/page.tsx` riga 25 usa `useState<any>(null)` per `editingPlayer`. Definire un tipo `ScoutPlayer` in `types.ts`.
- [x] **Test coverage** — Esiste solo un file test (`aggregation-repository.test.ts`). Aggiungere test per i repository critici (player, match, season) e per i flussi AI.

---

## 🟢 Nuove Funzionalità

### ⚽ Gestione Partite
- [ ] **Cronometro Live** — Aggiungere un timer in tempo reale nella pagina partita che permetta di registrare eventi al minuto esatto senza inserimento manuale.
- [ ] **Condivisione formazione** — Generare un'immagine PNG del layout tattico (campo con nomi) da condividere su WhatsApp/Telegram.
- [ ] **Storico formazioni** — Mostrare le formazioni delle ultime N partite per confronto tattico.

### 👥 Gestione Rosa
- [ ] **Numero di maglia** — Il tipo `Player` non ha il campo `number`. Aggiungere e mostrarlo nel layout tattico e nella lista rosa.
- [ ] **Dettaglio giocatore** — Pagina dedicata `/membri/[id]` con statistiche individuali, storico presenze allenamenti, e grafici di rendimento.

### 📊 Statistiche Avanzate
- [ ] **Heatmap presenze allenamenti** — Calendario tipo GitHub contributions con colori per frequenza presenze.
- [ ] **Statistiche individuali dettagliate** — Minuti totali giocati, media voto, clean sheet per portieri, % vittorie quando titolare.
- [ ] **Confronto giocatori** — Comparazione side-by-side di due giocatori.
- [ ] **Export statistiche in PDF** — Report di fine stagione stampabile.

### 🤖 AI & Automazione
- [ ] **Import rosa da foto** — Scansione OCR di fogli presenze cartacei o liste rosa da foto, usando l'AI per estrarre nomi e ruoli.
- [ ] **Chatbot tecnico** — Un assistente AI contestuale per chiedere "Chi ha segnato di più nelle ultime 5 partite?" senza cercare manualmente nei dati.

### 📱 Mobile & PWA
- [ ] **Notifiche push** — Reminder prima delle partite e delle sessioni di allenamento tramite Firebase Cloud Messaging.
- [x] **Offline support** — Service Worker per funzionalità base offline: consultare rosa, formazioni salvate, calendario.
- [x] **Installazione PWA completa** — Generare le icone mancanti (192x192, 512x512) dalla `favicon-16x16.png` e completare il supporto "Aggiungi a Home Screen".

### 🔧 Impostazioni & UX
- [ ] **Profilo allenatore** — Aggiungere nome squadra, logo, colori sociali personalizzabili nelle impostazioni.
- [ ] **Multi-lingua** — L'app è tutta in italiano. Aggiungere supporto `i18n` (almeno IT/EN) con `next-intl`.
- [ ] **Onboarding guidato** — Tour interattivo alla prima apertura che spiega le funzionalità principali.
- [ ] **Backup automatico** — Esportazione periodica programmata dei dati su Google Drive o via email.

---

## 📋 Priorità Consigliate

| Priorità | Attività | Impatto |
|----------|----------|---------|
| 🔴 Alta | Fix dark mode tabs (allenamento + statistiche) | Coerenza visiva |
| 🟡 Media | Numero di maglia + foto giocatori | UX molto richieste |
| 🟡 Media | Installazione PWA completa | Usabilità mobile |
| 🟢 Bassa | Suggerimento formazione AI avanzato | Feature Premium |
| 🟢 Bassa | Multi-lingua | Espansione mercato |
