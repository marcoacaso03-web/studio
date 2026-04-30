# 🎭 PitchMan — Strategia Tipi di Account

> Documento di pianificazione per l'implementazione di un sistema di ruoli e permessi differenziati all'interno di PitchMan Studio.

---

## 📌 Panoramica

L'app attualmente gestisce un singolo tipo di utente (`userId` / `teamOwnerId` su ogni documento Firestore).  
L'obiettivo è introdurre una **gerarchia di ruoli** che differenzi l'accesso alle funzionalità in base al contesto di utilizzo, garantendo sicurezza, scalabilità e un'esperienza utente appropriata per ogni profilo.

Il campo `role` sarà salvato nel **profilo utente Firestore** (`users/{uid}`) e sincronizzato come **Custom Claim Firebase Auth** (via Firebase Admin SDK) per permettere la validazione anche lato Firestore Security Rules e API Routes.

---

## 👥 Tipi di Account

### 1. 🛠️ Developer
**Chi è**: Il team tecnico di PitchMan (admin di sistema).  
**Scopo**: Debug, test, accesso a funzionalità sperimentali e strumenti di manutenzione.

**Permessi esclusivi**:
- Accesso al pannello di **Import Diretto (Scraper)**: sincronizzazione automatica rosa/calendario da URL TuttoCampo (usa Playwright + credenziali di sistema)
- Gestione **Esercizi Globali**: unico ruolo autorizzato a pubblicare esercizi visibili a *tutti* gli utenti della piattaforma
- Visibilità di log di errore, diagnostica e info di sistema nell'UI
- Bypass delle limitazioni di quota AI (numero di chiamate Genkit illimitate)
- Accesso a strumenti di seed/reset database (solo in dev environment)
- Vedere ed editare dati di qualsiasi team (super-admin)
- Flag `__devMode: true` in sessione per attivare UI debug overlay

**Come si assegna**: Manualmente via Firebase Admin Console o script dedicato. Non è assegnabile dall'UI dell'app.

---

### 2. 🏢 Director (Direttore Sportivo)
**Chi è**: Il responsabile tecnico/amministrativo di una società sportiva. Può supervisionare più squadre contemporaneamente (es. Prima Squadra, Primavera, Under 17, Under 15).  
**Scopo**: Visione macro della società, monitoraggio dei risultati di tutte le squadre, scouting strategico centralizzato, export report per la dirigenza.

---

#### 📋 Dashboard Risultati Multi-Squadra (`/director`)

Il Director ha accesso a una **home page dedicata** (route `/director`) non disponibile ad altri ruoli, che funge da pannello di controllo della società. La pagina è composta da:

**1. Feed "Ultimi Risultati"**
- Elenco cronologico di tutte le partite recenti di **tutte le squadre associate**, ordinate per data decrescente
- Ogni card del feed mostra:
  - Nome della squadra (es. "Under 17") con badge categoria
  - Avversario e risultato finale (es. **3 – 1 ✅ V**)
  - Tipo di gara (Campionato / Torneo / Amichevole)
  - Data e luogo (casa/trasferta)
  - Link rapido alla cronaca dettagliata della partita (sola lettura)
- Filtro per squadra: può isolare i risultati di una singola squadra
- Filtro per tipo partita: Campionato, Torneo, Amichevole
- Indicatore visivo di forma recente per ogni squadra (es. ultimi 5 risultati: ✅✅❌✅❌)

**2. Pannello "Stato Squadre"**
- Card sintetica per ogni squadra associata con:
  - Posizione in classifica (se disponibile nella stagione attiva)
  - Numero di partite giocate / programmate nella stagione corrente
  - Totale gol fatti / subiti in stagione
  - Prossima partita in programma (data + avversario)
  - Numero di giocatori infortunati al momento
- Ordinamento configurabile: per categoria, per stato di forma, per data prossima partita

**3. Pannello "Statistiche Aggregate Società"**
- KPI della società calcolati su tutte le squadre attive:
  - Totale gol segnati / subiti (aggregato)
  - % vittorie globale della stagione
  - Giocatori più in forma (top scorer cross-team)
  - Squadra con miglior rendimento del mese
- Grafico andamento risultati (W/D/L) aggregato per settimane/mese
- Export di questi KPI in formato CSV/PDF (funzionalità roadmap)

**4. Notifiche e Report AI**
- Ricezione di **digest settimanali** generati da Gemini: sintesi dei risultati della settimana, highlight di prestazioni rilevanti, alert su giocatori con molte assenze agli allenamenti
- *(Futuro)* Invio via email o push notification

---

#### 🔍 Scouting Unificato — Vista Director

Il Director ha accesso a una sezione **Scouting centralizzata** che aggrega i dati di scouting di **tutti gli allenatori** della società in un'unica interfaccia navigabile per categorie.

**Struttura della sezione**:

```
/director/scout
├── Tutte le categorie            ← Vista panoramica
├── Prima Squadra                 ← Tab / sezione per team
├── Primavera / Under 19
├── Under 17
├── Under 15
└── (altre categorie dinamiche)
```

**Funzionalità per categoria**:
- Ogni categoria mostra la lista di **giocatori osservati** dagli scout/allenatori di quella squadra
- Ogni scheda giocatore include: nome, ruolo, squadra attuale, categoria Scout assegnata (es. "Priorità Alta", "Da Seguire", "Osservato"), note
- Le **categorie Scout** (colorHex + nome, già modellate in `ScoutCategory`) sono **condivise globalmente** a livello di società — il Director le crea e gestisce, gli allenatori le usano per taggare i giocatori osservati
- Vista unificata: il Director può vedere **tutti i giocatori osservati** di tutte le squadre in un'unica lista filtrata per categoria Scout (indipendentemente dalla squadra che li ha inseriti)

**Funzionalità esclusive Director sullo Scouting**:
- ✅ **Crea / modifica / elimina le categorie Scout** della società (es. "Priorità Alta 🔴", "Da Monitorare 🟡", "Archivio 🔵")
- ✅ **Sposta un giocatore osservato** da una categoria all'altra o da una squadra all'altra (es. un Under 17 promosso in Primavera)
- ✅ **Aggiunge note globali** a un giocatore osservato, visibili a tutti gli allenatori della società
- ✅ **Export della lista scout** filtrata in CSV (per riunioni di mercato)
- ✅ Può **archiviare o eliminare** voci scout obsolete
- 👁️ Sola lettura sulle note private inserite dai singoli allenatori (non può editarle)

**Filtri disponibili nella vista Scouting Director**:
- Per categoria Scout (es. "Priorità Alta")
- Per squadra/categoria di età (Prima Squadra, Primavera, ecc.)
- Per ruolo (Portiere, Difensore, ecc.)
- Per squadra di provenienza del giocatore
- Ricerca testuale per nome

---

#### 📊 Accesso alle Statistiche delle Squadre (sola lettura)

- Può navigare la sezione `/statistiche` di **ogni squadra** associata, commutando la squadra con un selettore in cima alla pagina
- Vede i grafici di andamento risultati, i top scorer, le statistiche individuali
- **Non può** modificare dati, aggiungere eventi o alterare la rosa

---

#### ⚙️ Gestione Operativa (limitata)

- Può **creare una nuova stagione** per una squadra associata e impostarne il nome
- Può **archiviare una stagione** a fine anno
- **Non può** modificare la rosa, inserire cronaca di partita o gestire presenze allenamento

---

**Limitazioni**:
- Non accede ai log tecnici né alle funzioni di import da TuttoCampo
- Non può impostare esercizi come globali nella libreria
- Non vede i dati di squadre non associate alla sua società

---

### 3. ⚽ Allenatore (Coach)
**Chi è**: L'allenatore principale di una singola squadra. È il tipo di account primario e il più comune.  
**Scopo**: Gestione completa del ciclo di vita della squadra (rosa, partite, allenamenti, formazioni).

**Permessi**:
- Accesso completo a **tutte le sezioni** dell'app per la propria squadra
- Accesso all'**Importazione AI (Manuale)**: può incollare testo o caricare file (PDF/Immagini) per popolare rosa e calendario via `AIService`
- Utilizzo del **chatbot AI** statistico e tattico
- Gestione della libreria esercizi:
  - **Privati**: visibili solo a lui
  - **Sociali/Società**: visibili al suo Director

**Limitazioni**:
- Vede solo i dati della propria squadra (isolamento garantito da `teamOwnerId`)
- Non può impostare esercizi come **Globali** (solo Developer)
- Non accede ai dati di altre squadre se non hanno condiviso il codice
- Non ha accesso allo Scraper Diretto (richiede intervento Developer per setup iniziale)

---

### 4. 👤 Giocatore (Player) — *Futuro*
**Chi è**: Un giocatore della rosa che accede alla propria scheda personale.  
**Scopo**: Visualizzare le proprie statistiche, presenze, infortuni. Funzionalità "Modalità Spogliatoio".

**Permessi**:
- Sola lettura della propria `Player` record e delle proprie `PlayerMatchStats`
- Accesso al **modulo sondaggi/questionari** (roadmap: "Modalità spogliatoio")
- Ricezione notifiche push (convocazione, allenamento)

**Limitazioni**:
- Nessun accesso ai dati degli altri giocatori né alle funzioni gestionali
- Account collegato al suo `playerId` nel documento Firestore

---

## 🗄️ Struttura Dati

### Documento `users/{uid}` (Firestore)
```typescript
export type AccountRole = 'developer' | 'director' | 'coach' | 'player';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: AccountRole;
  teamIds?: string[];        // Squadre associate (Director: N, Coach: 1)
  linkedPlayerId?: string;   // Solo per tipo 'player'
  createdAt: string;
  updatedAt: string;
}
```

### Custom Claim Firebase Auth
```json
{
  "role": "coach",
  "teamIds": ["team_abc123"]
}
```
I Custom Claims vengono impostati via **Firebase Admin SDK** (in una API Route protetta o Cloud Function) e vengono inclusi nell'ID Token JWT, permettendo la loro verifica nelle **Firestore Security Rules** senza query aggiuntive.

---

## 🔐 Firestore Security Rules (Schema)

```
// Esempio schema regola per i documenti della stagione
match /seasons/{seasonId} {
  allow read: if isCoachOrAbove() && ownsTeam(resource.data.teamOwnerId);
  allow write: if isCoach() && ownsTeam(resource.data.teamOwnerId);
  allow read: if isDeveloper();
}

function isCoachOrAbove() {
  return request.auth.token.role in ['coach', 'director', 'developer'];
}
function isDeveloper() {
  return request.auth.token.role == 'developer';
}
function ownsTeam(teamOwnerId) {
  return request.auth.uid == teamOwnerId;
}
```

---

## 🛠️ Passi di Implementazione

### Fase 1 — Fondamenta (Backend & Dati)

- [ ] **1.1** Aggiungere il tipo `AccountRole` e l'interfaccia `UserProfile` in `src/lib/types.ts`
- [ ] **1.2** Creare la collection `users` su Firestore con il documento profilo per ogni utente registrato
- [ ] **1.3** Creare `src/lib/repositories/user.repository.ts` con CRUD per `UserProfile`
- [ ] **1.4** Creare una **API Route** `POST /api/admin/set-role` (protetta con Firebase Admin) che:
  - Aggiorna il campo `role` nel documento Firestore `users/{uid}`
  - Imposta il Custom Claim `role` sull'account Firebase Auth via `admin.auth().setCustomUserClaims(uid, { role })`
- [ ] **1.5** Aggiornare il flusso di **signup** in `useAuthStore` per creare il documento `UserProfile` di default con `role: 'coach'`

### Fase 2 — Hook & Context

- [ ] **2.1** Creare il hook `useUserRole()` in `src/hooks/useUserRole.ts` che:
  - Legge il Custom Claim dal token JWT (via `getIdTokenResult()`)
  - Espone `{ role, isCoach, isDirector, isDeveloper }`
- [ ] **2.2** Creare il hook `usePermissions()` con funzioni helper (es. `canAccessScouting()`, `canImportTuttoCampo()`)
- [ ] **2.3** Integrare `useUserRole()` nello store Zustand (`useAuthStore`) per rendere il ruolo globalmente disponibile

### Fase 3 — UI & Gating

- [ ] **3.1** Creare il componente `<RoleGuard role="developer">` che wrappa le sezioni protette e mostra un fallback se il ruolo non è sufficiente
- [ ] **3.2** Nascondere il bottone **"Import TuttoCampo"** a tutti i ruoli tranne `developer`
- [ ] **3.3** Aggiungere sezione **"Dashboard Direttore"** in `/statistiche` visibile solo a `director` e `developer`
- [ ] **3.4** Mostrare il **badge ruolo** nel profilo utente e nell'header dell'app

### Fase 4 — Firestore Security Rules

- [ ] **4.1** Aggiornare `firestore.rules` per validare il `role` dal Custom Claim JWT su ogni collection critica (`seasons`, `players`, `matches`, `trainingsessions`, `exercises`)
- [ ] **4.2** Testare le regole con Firebase Emulator Suite

### Fase 5 — Funzionalità Specifiche per Ruolo

- [ ] **5.1** `developer`: Attivare la sezione "Import TuttoCampo" nel dialogo (`import-tuttocampo-dialog.tsx`)
- [ ] **5.2** `director`: Implementare vista aggregata multi-squadra in `/statistiche`
- [ ] **5.3** `player` *(futuro)*: Creare il mini-portale giocatore con accesso alla propria scheda

---

## 📊 Matrice Permessi

| Funzionalità | Developer | Director | Coach | Player |
|---|:---:|:---:|:---:|:---:|
| Gestione Rosa | ✅ | 👁️ | ✅ | ❌ |
| Cronaca Partite | ✅ | 👁️ | ✅ | ❌ |
| Allenamenti | ✅ | 👁️ | ✅ | ❌ |
| Statistiche | ✅ | ✅ | ✅ | 👁️* |
| Statistiche Aggregate Multi-team | ✅ | ✅ | ❌ | ❌ |
| Scouting | ✅ | ✅ | ✅ | ❌ |
| Chatbot AI | ✅ | ✅ | ✅ | ❌ |
| Import TuttoCampo | ✅ | ❌ | ❌ | ❌ |
| Libreria Esercizi (globale) | ✅ | ❌ | ❌ | ❌ |
| Export Dati (CSV/PDF) | ✅ | ✅ | ❌ | ❌ |
| Pannello Admin | ✅ | ❌ | ❌ | ❌ |
| Propria Scheda Giocatore | ❌ | ❌ | ❌ | ✅ |

> **Legenda**: ✅ Accesso completo · 👁️ Sola lettura · 📝 Scrittura operativa limitata · ❌ Nessun accesso · *solo propri dati

---

## 🔗 File Coinvolti

| File | Modifica |
|---|---|
| `src/lib/types.ts` | Aggiungere `AccountRole`, `UserProfile` |
| `src/lib/repositories/user.repository.ts` | Nuovo file |
| `src/hooks/useUserRole.ts` | Nuovo file |
| `src/hooks/usePermissions.ts` | Nuovo file |
| `src/store/useAuthStore.ts` | Integrare `role` nello store |
| `src/components/auth/RoleGuard.tsx` | Nuovo componente |
| `src/app/api/admin/set-role/route.ts` | Nuova API Route |
| `firestore.rules` | Aggiornare regole per `role` |
| `src/components/partite/import-tuttocampo-dialog.tsx` | Gating per `developer` |

## 🛡️ Sicurezza e Resilienza Dati (Disaster Recovery)

Per proteggere la società da eventuali sabotaggi (es. un allenatore che lascia e cancella i dati) o errori umani, implementeremo le seguenti misure:

### 1. Pattern "Soft Delete"
- **Implementazione**: Nessun documento critico (`Player`, `Match`, `TrainingSession`) viene eliminato fisicamente.
- **Logica**: Viene aggiunto un campo `deleted: boolean` e `deletedAt: timestamp`.
- **UI**: I componenti filtrano automaticamente i documenti dove `deleted != true`.
- **Recupero**: Il Developer può "ripristinare" i documenti tramite lo strumento di amministrazione con un semplice toggle.

### 2. Point-in-Time Recovery (PITR)
- Sfrutteremo la funzionalità nativa di **Google Cloud Firestore PITR**.
- Consente di recuperare dati fino a **7 giorni nel passato**.
- In caso di sabotaggio massivo, il Developer può eseguire uno script che esegue una "Time-travel Query" sul `teamOwnerId` interessato e ripristina lo stato precedente alla manomissione.

### 3. Snapshot di Fine Fase (Backups)
- Alla chiusura di ogni **Stagione** o su richiesta del **Director**, il sistema genera uno Snapshot (JSON) dello stato corrente della squadra.
- Questi backup sono salvati in una collezione `system_backups` accessibile solo al ruolo `developer`.

### 4. Audit Log (Tracciabilità)
- Ogni modifica critica viene tracciata in un log interno che registra: `userId`, `timestamp`, `action` (es. "DELETE_ALL_PLAYERS"), `previousState`.
- Questo permette al Director o al Developer di individuare immediatamente chi ha compiuto l'azione e quando.

---

*PitchMan — Strategia tipi di account — Ultimo aggiornamento: Aprile 2026*
