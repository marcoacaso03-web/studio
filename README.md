# ⚽ PitchMan — Studio

**Il sistema operativo intelligente per la gestione tecnica calcistica.**

PitchMan è una PWA (Next.js 15) per allenatori e staff tecnico: gestione rosa,
calendario, cronaca live, allenamenti, scouting e statistiche — con un assistente
AI (Gemini 2.5 Flash via Genkit) per importazione da testo/immagini, suggerimento
formazioni e chatbot tattico. Funziona anche offline (Dexie/IndexedDB).

> Documentazione tecnica di riferimento: **[ARCHITECTURE.md](./ARCHITECTURE.md)**.
> I documenti in `docs/` (es. `implementation.md`, `type_strategy.md`, `PROJECTS.md`)
> sono **roadmap / piani di business**, non lo stato attuale del codice.

---

## 🛠️ Tech Stack

- **Core**: Next.js 15 (App Router) · React 19 · TypeScript
- **Backend/DB**: Firebase (Firestore, Auth) · Vercel Blob
- **AI**: Google Genkit + Gemini 2.5 Flash
- **UI**: Tailwind CSS · shadcn/ui · Lucide · Framer Motion
- **State**: Zustand (contesto squadra + store per-feature) · Dexie (offline PWA)
- **Charts**: Recharts

## 📁 Struttura (reale)

```
src/
  app/            routes App Router + error.tsx per sezione
  ai/             flussi Genkit (chatbot, import rosa/calendario, lineup) + genkit.ts
  components/
    ui/           primitivi shadcn + async-feedback (loading/errore coerente)
    layout/       header, bottom-nav, auth/role guard
    ai/ giocatori/ partite/ allenamento/ statische/   componenti di dominio
  lib/
    repositories/ CRUD Firestore (repository pattern)
    hooks/        useAsyncAction, useUserRole, usePermissions, use-toast
    schemas.ts types.ts utils.ts db.ts firebase-admin.ts
  services/       logica use-case: ai.service, stats-advanced-service
  store/          useTeamStore (contesto) + store per-feature (players, matches, …)
  firebase/       provider Auth + Firestore init
```

## 🔑 Convenzioni chiave

- **Ownership dei dati**: ogni store per-feature è l'unico proprietario della sua
  collection Firestore. `useTeamStore` è la fonte di verità per il contesto
  trasversale (utente, ruolo, stagione attiva).
- **Logica di servizio** in `src/services` (astrazione flussi AI, aggregazioni).
- **Errori/loading async**: hook `useAsyncAction` + `<AsyncFeedback>` — pattern
  unico in tutti i dialoghi AI (niente `console.error` nudi né spinner reinventati).
- **Sicurezza**: Firestore Security Rules validano il `role` dai Firebase Auth
  custom claims; le API admin verificano il token lato server.

## 🚀 Setup locale

```bash
npm install
cp .env.example .env.local   # valorizza le chiavi (NON committare il .env.local)
npm run dev                  # http://localhost:9002
```

Le variabili d'ambiente (Firebase, Gemini, Blob) vivono **solo su Vercel** e non
sono nel repo. `.env*` è git-ignorato. Vedi `.env.example` per l'elenco.

## ✅ Quality gates

- `npm run lint` — ESLint (next/core-web-vitals)
- `npm test` — Jest (repository + service layer + hook `useAsyncAction`)
- `npm run test:e2e` — Playwright smoke test (richiede `npx playwright install`)
- Type-check: gestito da Vercel in `next build` (non duplicato in CI)

La CI GitHub Actions esegue **lint + unit test + E2E** a ogni push/PR su `main`.

## 📦 Build & Deploy

- `npm run build` → `npm run start` (o Vercel, già collegato).
- PWA: service worker + manifest in `public/` (offline-first).

---

*PitchMan — sviluppato per il calcio dilettantistico / giovanile.*
