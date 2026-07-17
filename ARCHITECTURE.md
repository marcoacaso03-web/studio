# PitchMan — Architettura

> Documento di riferimento per l'orientamento nel codebase. Descrive la
> struttura **reale** (non quella semplificata del README marketing).

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Firebase: Firestore (DB), Auth, Storage/Blob
- Genkit + Gemini 2.5 Flash (AI)
- Tailwind + shadcn/ui + Framer Motion
- Zustand (state), Dexie/IndexedDB (offline PWA)
- Recharts (grafici)

## Convenzioni — "chi possiede cosa"

### Dati di dominio → per-feature store (single owner per collection)
Ogni store è l'unico proprietario della sua collection Firestore e delle sue
query. Non duplicare query tra store.

| Store | Collection / dati |
|---|---|
| `usePlayersStore` | `players` (rosa) |
| `useMatchesStore` | `matches` (calendario, cronaca) |
| `useSeasonsStore` | `seasons` (stagioni) + stagione attiva |
| `useTrainingStore` | `trainingSessions` + presenze |
| `useStatsStore` | statistiche aggregate (derivate) |
| `useSettingsStore` | impostazioni utente |
| `useTestsStore` | test atletici |

### Contesto di squadra trasversale → `useTeamStore`
`useTeamStore` è la **fonte di verità per lo stato di coordinamento** letto da
tutti gli altri store: utente autenticato, ruolo (`AccountRole`), stagione
attiva, flag `teamReady`. I feature-store non devono più pescare stagione/utente
via `getState()` sparso: leggono da qui (selector `selectActiveSeasonId`,
`selectUserId`, …). I dati di dominio restano nei rispettivi store.

### Logica di servizio → `src/services`
Tutta la logica "use-case" (chiamate AI, aggregazioni, business rules) vive in
`src/services`:
- `ai.service.ts` — astrazione dei flussi Genkit (import Rosa/Calendario,
  suggerimento formazione, chatbot).
- `stats-advanced-service.ts` — calcoli statistici avanzati.

I repository (`src/lib/repositories/*`) sono il livello CRUD Firestore puro,
senza logica di dominio. Le AI flow (`src/ai/flows/*`) sono i prompt Genkit.

## Gestione errori / loading (centralizzata)
Prima ogni dialogo AI gestiva `isLoading`/`isAnalyzing`/`console.error` a modo
suo. Ora c'è un pattern unico:

- Hook `useAsyncAction(action)` → `{ data, error, loading, run, reset }`.
  Cattura l'errore in una stringa uniforme (niente `console.error` nudi).
- Componente `<AsyncFeedback loading error />` (`src/components/ui/async-feedback.tsx`)
  → render coerente di spinner + messaggio di errore in tutti i dialoghi.

Applicato a: `smart-player-dialog`, `smart-lineup-dialog`,
`import-tuttocampo-dialog`, `floating-assistant`.

I limiti di pagina usano ancora `error.tsx` / `global-error.tsx` (Next.js
error boundary) — coprono errori di rendering, non le chiamate async (quelle
sono coperte dal pattern sopra).

## Struttura directory
```
src/
  app/            # routes (App Router) + error.tsx per sezione
  ai/             # flussi Genkit + genkit.ts
  components/
    ui/           # primitivi shadcn + async-feedback
    layout/       # header, bottom-nav, auth/role guard
    ai/ giocatori/ partite/ allenamento/  # componenti di dominio
  lib/
    repositories/ # CRUD Firestore
    hooks/        # useAsyncAction, useUserRole, usePermissions, use-toast
    schemas.ts types.ts utils.ts db.ts firebase-admin.ts
  services/       # logica use-case (ai.service, stats-advanced-service)
  store/          # Zustand: useTeamStore (ctx) + per-feature store
  hooks/          # useUserRole, usePermissions, usePWAInstall
```

## Sicurezza
- Firestore Security Rules (`firestore.rules`) validano il `role` dai Firebase
  Auth custom claims (`getRole()`).
- Gating UI: `RoleGuard` + `useUserRole`/`usePermissions`.
- `middleware.ts` (preventivo): rifiuta le richieste a `/api/admin/*` prive di
  header `Authorization`. La verifica vera del token/ruolo resta nelle route
  handler (es. `set-role` controlla `role === 'developer'`). Le page autenticate
  non sono protette lato server perché l'auth è client-side (onAuthStateChanged,
  nessun session cookie): per farlo serve adottare Firebase session cookies.

## Test
- Unitari (Jest): repository, `stats-advanced-service`, hook `useAsyncAction`,
  componente `AsyncFeedback`, service layer `ai.service` (flussi mockati).
- E2E (Playwright): `e2e/smoke.spec.ts` verifica lo shell dell'app + floating
  assistant; gira su CI (`test:e2e`, richiede `npx playwright install`).
- `npm test` + `npm run test:e2e` nella CI GitHub Actions. Type-check affidato a
  Vercel (`next build`).

## Note di manutenzione
- `next-pwa` è deprecato su Next 15: valutare migrazione a `@serwist/next`
  (verificare la build PWA prima di tagliare). Non ancora fatto.
- `next lint` è deprecato in Next 16: pianificare migrazione a ESLint CLI
  (`@next/codemod next-lint-to-eslint-cli`) prima dell'upgrade.
- `packageManager` è dichiarato in package.json per rendere `npm ci`
  deterministico tra macchine/CI.
- Vulnerabilità residue (npm audit): transitive in Genkit/OpenTelemetry/Firebase
  Admin; richiedono un major upgrade breaking di Genkit → non auto-fixate.
