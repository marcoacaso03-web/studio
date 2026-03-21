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

### 👥 Gestione Rosa


### 📊 Statistiche Avanzate
- [ ] **Export statistiche in PDF** — Report di fine stagione stampabile.

### 🤖 AI & Automazione
- [ ] **Import rosa da foto** — Scansione OCR di fogli presenze cartacei o liste rosa da foto, usando l'AI per estrarre nomi e ruoli.

### 📱 Mobile & PWA
- [ ] **Estensione Leggera Smartwatch** — Esplorare lo sviluppo di un mini target layout indossabile per prendere presenze on-the-go o far scattare un cronometro partita live dall'orologio da polso.

### 🔧 Impostazioni & UX
- [ ] **Profilo allenatore** — Aggiungere nome squadra, logo, colori sociali personalizzabili nelle impostazioni.
- [ ] **Multi-lingua** — L'app è tutta in italiano. Aggiungere supporto `i18n` (almeno IT/EN) con `next-intl`.
- [ ] **Onboarding automatizzato** — Tour interattivo alla prima apertura con micro-animazioni.
- [ ] **Esportazioni Dati Aggregate** — Pulsante di Export Excel / CSV immediato basato sulle tabelle statistiche, necessario per presidenti / scouting manager che preferiscono la carta.
- [ ] **Backup automatico (Cloud Scheduling)** — Esportazione periodica programmata dei database critici verso Google Cloud Storage / Drive come disaster recovery di primo livello.

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
