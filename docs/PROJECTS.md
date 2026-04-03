# 🗺️ PitchMan — Roadmap & Miglioramenti

> Documento generato dall'analisi completa del codebase. Ogni voce è concreta e attuabile.

---

## 🔴 Bug & Fix Immediati

- [ ] **Gestione Fallback e Rate-Limit API Genkit**: Se un prompt a Genkit fallisce o va in timeout, l'interfaccia non sempre gestisce l'errore o offre modalità di "degrado assecondato" (graceful degradation) per l'utente, bloccando il flow.
- [ ] **Hydration Errors nei Modali**: Con React 18 / Next.js e componenti headless (Radix UI), verificare e prevenire avvisi di mismatch HTML tra il server rendering e la visualizzazione locale.

---

## 🟡 Ottimizzazioni

### Performance


### Sicurezza
- [ ] **Validazione password al signup** — `useAuthStore.ts` non impone requisiti minimi sulla password (lunghezza, complessità). Firebase accetta qualsiasi password ≥6 caratteri ma l'UI non guida l'utente.

### Codice

- [ ] **Gestione Errori Globali (Global Error Boundary)**: Introdurre i file `error.tsx` e `global-error.tsx` nelle directory nevralgiche dell'App Router. L'intera app non deve crashare se una query fallisce isolatamente.
- [ ] **Design Pattern "Service Layer" per l'AI**: Estrapolare le dirette invocazioni a Genkit dall'Interfaccia Grafica e ingabbiarle in un *Domain Service*. Rende il codice DRY e facile da fare Mocking per test unitari automatizzati.

---

## 🟢 Nuove Funzionalità

### ⚽ Gestione Partite
- [ ] **Condivisione formazione** — Generare un'immagine PNG del layout tattico (campo con nomi) da condividere su WhatsApp/Telegram.
- [ ] **Storico formazioni** — Mostrare le formazioni delle ultime N partite per confronto tattico.

### Codice di condivisione della stagione
- Nella schermata gestione stagione ci deve essere un bottone per mostrare il codice della stagione, crea quindi una sezione nella gestione stagione in cui inserendo il codice della stagione che è una sequenza di lettere e numeri che potrebbe anche coincidere con l'ID, se lo ritieni ragionevole(tu intelligenza artificiale), inserendo tale codice l'utente ottiene l'accesso alla stagione con quell 'id dal proprio account


### 📊 Statistiche Avanzate
- [ ] **Export statistiche in PDF** — Report di fine stagione stampabile.

### 🤖 AI & Automazione
- [ ] **Import rosa da foto** — Scansione OCR di fogli presenze cartacei o liste rosa da foto, usando l'AI per estrarre nomi e ruoli.

### 📱 Mobile & PWA
- [ ] **Estensione Leggera Smartwatch** — Esplorare lo sviluppo di un mini target layout indossabile per prendere presenze on-the-go o far scattare un cronometro partita live dall'orologio da polso.

### 🔧 Impostazioni & UX
- [x] **Redesign Neon High-Viz** — Applicare il nuovo tema scuro/chiaro con i colori ufficiali del brand a tutte le schermate principali.
- [ ] **Profilo allenatore** — Aggiungere nome squadra, logo, colori sociali personalizzabili nelle impostazioni.
- [ ] **Multi-lingua** — L'app è tutta in italiano. Aggiungere supporto `i18n` (almeno IT/EN) con `next-intl`.
- [ ] **Onboarding automatizzato** — Tour interattivo alla prima apertura con micro-animazioni.
- [ ] **Esportazioni Dati Aggregate** — Pulsante di Export Excel / CSV immediato basato sulle tabelle statistiche, necessario per presidenti / scouting manager che preferiscono la carta.
- [ ] **Backup automatico (Cloud Scheduling)** — Esportazione periodica programmata dei database critici verso Google Cloud Storage / Drive come disaster recovery di primo livello.

---

## 🚀 Feature Rivoluzionarie (Game Changers)

### 🧩 Automazione & Campo
- [ ] **Lavagna Tattica Interattiva** — Un campo trascinabile (whiteboard digitale) per spiegare schemi e movimenti durante l'allenamento.
- [ ] **Cronometro Match con Eventi** — Gestione live della partita con tasti rapidi "Gol/Cartellino" che registrano l'ora esatta automaticamente.

### 🧠 Intelligenza Artificiale
- [ ] **AI Assistant "Best 11"** — Suggerimento automatico della formazione titolare incrociando presenze agli allenamenti e performance nelle ultime gare.
- [ ] **Match Flow Timeline** — Generazione automatica di una timeline visiva degli eventi della partita con icone e momenti chiave.

---

## 🛠️ Ottimizzazioni Tecniche e Architetturali

### 🎨 Design System
- [x] **Standardizzazione Design Tokens** — Centralizzare tutti i colori neon in variabili CSS (`--brand-yellow`, etc.) per evitare duplicazioni di hex code sparsi nei componenti.
- [x] **Skeleton Loaders Neon** — Implementare caricamenti a impulsi neon coerenti in ogni pagina per migliorare la percezione della velocità.
- [ ] **Responsive Grid Layouts** — Sostituire le tabelle classiche con layout a griglia/flex per una leggibilità perfetta su smartphone (formato "card-list").

### 🏗️ Codice & Stabilità
- [x] **Zod Schema Validation** — Proteggere le letture da Firestore con schemi Zod per evitare crash se un campo (es. `focus`) è mancante o malformato.
- [x] **Offline-First Strategy** — Ottimizzare il Service Worker per garantire che il registro presenze e il live match funzionino perfettamente anche con campo senza segnale.
- [x] **Refactoring Store Persistence** — Implementare `persist` di Zustand per salvare lo stato locale (es. filtri selezionati) tra un ricaricamento e l'altro.

---

## 🎨 Re-design App 
- [x] **Schermata di Login**:
  - Implementare tema scuro totale (sfondo molto scuro/nero).
  - Mostrare il nuovo logo "PitchMan" con font font sans-serif bianco.
  - Input "Email" e "Password" con bordo a gradiente neon (dal giallo, al verde, al blu).
  - Bottone "ACCEDI" arrotondato (pillola) con gradiente di sfondo e glow effect neon.
  - Link "Password dimenticata?" posizionato sotto con gradiente neon/ciano su testo.
- [ ] **Tema Globale (Future modifiche)**:
  - Estendere il tema neon scuro nell'app intera, modificando `tailwind.config.ts`.
  - Introdurre gradini di sfondi molto scuri e bordi/elementi attenzionali neon.
- [x] **Home / Calendario / Dashboard**:
  - Adattare layout dei panel e card per usare lo sfondo scuro mantenendo un forte contrasto con bordi e icone neon.
- [x] **Bottom Navigation**:
  - Implementare tema scuro con icone neon glow per l'elemento attivo.
- [x] **Altre Pagine (Rosa, Impostazioni, Allenamenti)**:
  - Convertire tabelle, menu e finestre modali.
  - Applicare il nuovo stile coerente (accordion illuminati, gradienti neon, ecc.).
- [ ] **Altre Pagine (Partite, Scouting, ecc.)**:
  - Applicare il nuovo stile coerente in tutta l'applicazione passo passo.

---

## 📋 Priorità Consigliate

| Priorità | Attività | Impatto |
|----------|----------|---------|
| 🔴 Alta | Implementazione Caching (SWR/React Query) | Riduzione costi Firestore e UI responsiva |
| 🔴 Alta | Prevenzione Hydration Errors e Global Error Boundary | Resilienza PWA ed eliminazione freeze improvvisi |
| 🟡 Media | Cronometro Live e Gestione formati Export Dati | UX ad alte aspettative per direttori sportivi |
| 🟡 Media | Integrazione Vector Search AI per Scouting | Differenziazione competitiva assoluta |
| 🟡 Media | Firebase App Check | Sicurezza budget as a service |
| 🟢 Bassa | Layout companion WearOS / Apple Watch | WOW Factor / Usability "a bordo campo" |
| 🟢 Bassa | Generazione referto pagelle partita by AI | Engagement Premium / Giocatori |
