# Pages, Dialog e Card — PitchMan

> Ultimo aggiornamento: 2026-04-09
> Struttura basata su Next.js App Router (`src/app/`)

---

## 📄 Pages

### 1. Dashboard
| Campo | Valore |
|---|---|
| **Route** | `/` |
| **File** | `src/app/page.tsx` |
| **Componente** | `HomePage` |
| **Descrizione** | Hub principale dell'app. Gestisce la fase di splash (caricamento dati e Auth check) e mostra il riepilogo stagione: prossimo impegno, azioni rapide, stato rosa e card Wall of Fame (Bomber, Assistman, Fedelissimo). |
| **Card** | `Prossimo Impegno` · `Azioni Rapide` · `Stato Rosa` · `Wall of Fame` |
| **Dialog usati** | `MatchFormDialog` · `FullCalendarDialog` · `GuideDialog` |

---

### 2. Login
| Campo | Valore |
|---|---|
| **Route** | `/login` |
| **File** | `src/app/login/page.tsx` |
| **Componente** | `LoginPage` |
| **Descrizione** | Pagina di autenticazione utente. |

---


---

### 4. Dettaglio Partita
| Campo | Valore |
|---|---|
| **Route** | `/calendario/[id]` |
| **File** | `src/app/calendario/[id]/page.tsx` |
| **Componente** | `MatchDetailPage` |
| **Descrizione** | Dettaglio di una singola partita. Mostra risultato, data, casa/trasferta. Ha tre tab: Cronaca (eventi), Squadra (formazione) e Note. |
| **Card** | Card riepilogo partita (risultato + metadati) |
| **Tab** | Cronaca · Squadra · Note |
| **Dialog usati** | `MatchFormDialog` |

---

### 5. Rosa / Membri
| Campo | Valore |
|---|---|
| **Route** | `/membri` |
| **File** | `src/app/membri/page.tsx` |
| **Componente** | `RosaPage` |
| **Descrizione** | Lista giocatori della rosa, raggruppati per ruolo (Portieri, Difensori, Centrocampisti, Attaccanti) con accordion espandibile. Supporta ricerca per nome. |
| **Dialog usati** | `PlayerFormDialog` (Nome, Cognome, Ruolo) · `SmartPlayerDialog` · `AlertDialog` (conferma eliminazione) |

---

### 6. Dettaglio Giocatore
| Campo | Valore |
|---|---|
| **Route** | `/membri/[id]` |
| **File** | `src/app/membri/[id]/page.tsx` |
| **Componente** | `PlayerDetailPage` |
| **Descrizione** | Scheda completa di un giocatore con statistiche stagionali (presenze, gol, assist, minuti, cartellini), radar chart del profilo tecnico, bar chart V/P/S, e heatmap presenze allenamenti e partite. |
| **Card** | `StatCard` (×6 base + avanzate) · Card Profilo Tecnico (RadarChart) · Card Risultati Personali (BarChart) · Card Storico Presenze Partite · Card Storico Presenze Allenamenti |

---

### 7. Confronto Giocatori
| Campo | Valore |
|---|---|
| **Route** | `/membri/confronto` |
| **File** | `src/app/membri/confronto/page.tsx` |
| **Componente** | `ConfrontoPage` |
| **Descrizione** | Pagina di confronto fianco-a-fianco tra due giocatori. |

---

### 8. Sessioni Allenamento
| Campo | Valore |
|---|---|
| **Route** | `/allenamento` |
| **File** | `src/app/allenamento/page.tsx` |
| **Componente** | `AllenamentoPage` |
| **Descrizione** | Vista settimanale degli allenamenti con navigazione tra settimane (← →) e selezione data via Popover/Calendar. Ogni sessione mostra data, focus e barra presenze. Supporta filtro per focus tramite DropdownMenu. |
| **Card** | Card sessione allenamento (data · focus · barra presenze) |
| **Dialog usati** | `Dialog` Generatore Sessioni · `TrainingStatsDialog` · `AlertDialog` Elimina Singola · `AlertDialog` Elimina Settimana · `AlertDialog` Reset Totale |

---

### 9. Dettaglio Allenamento
| Campo | Valore |
|---|---|
| **Route** | `/allenamento/[id]` |
| **File** | `src/app/allenamento/[id]/page.tsx` |
| **Componente** | `TrainingDetailPage` |
| **Descrizione** | Dettaglio di una sessione. Due tab: **Programma** (focus + note esercizi) e **Presenze** (lista giocatori con stato Presente/Ritardo/Assente). |
| **Card** | Card Esercitazioni e Obiettivi · Card giocatore presenza (×n per ogni giocatore) |
| **Tab** | Programma · Presenze |

---

### 10. Scout
| Campo | Valore |
|---|---|
| **Route** | `/scout` |
| **File** | `src/app/scout/page.tsx` |
| **Componente** | `ScoutPage` |
| **Descrizione** | Lista talenti monitorati, filtrabili per etichetta (categorie colorate) e ricerca per nome. Supporta infinite scroll. |
| **Card** | Card talento scout (nome · ruolo · squadra · note · etichette) |
| **Dialog usati** | `ScoutPlayerDialog` · `ScoutCategoryDialog` · `AlertDialog` (conferma eliminazione) |

---

### 11. Statistiche
| Campo | Valore |
|---|---|
| **Route** | `/statistiche` |
| **File** | `src/app/statistiche/page.tsx` |
| **Componente** | `StatistichePage` |
| **Descrizione** | Pannello statistiche stagionali a tre tab. |
| **Tab** | Record · Giocatori (Leaderboard) · Grafici |
| **Componenti usati** | `TeamRecord` · `PlayerLeaderboard` · `VenueStatsCharts` · `GoalVenueCharts` · `TeamPerformanceChart` · `GoalsIntervalChart` · `AdvancedStatsSection` |

---

### 12. Impostazioni (Altro)
| Campo | Valore |
|---|---|
| **Route** | `/altro` |
| **File** | `src/app/altro/page.tsx` |
| **Componente** | `AltroPage` |
| **Descrizione** | Pagina impostazioni. Menu a voci cliccabili che aprono dialog contestuali: Profilo Allenatore, Gestione Squadra, Notifiche (soon), Tema (toggle dark/light), Privacy & Sicurezza. |
| **Dialog usati** | `Dialog` Profilo Allenatore · `Dialog` Gestione Squadra · `Dialog` Privacy & Dati · `AlertDialog` Conferma Reset Stagione · `AlertDialog` Elimina Stagione |

---

## 🪟 Dialog

### Dialog Partite (`src/components/partite/`)

| File | Componente | Descrizione |
|---|---|---|
| `full-calendar-dialog.tsx` | `FullCalendarDialog` | Calendario completo di tutte le partite, aperto dalla Dashboard. |
| `match-form-dialog.tsx` | `MatchFormDialog` | Form di creazione/modifica partita (data, avversario, casa/trasferta, risultato, tipo). |
| `match-event-dialog.tsx` | `MatchEventDialog` | Form per aggiungere/modificare eventi di partita (gol, assist, cartellini, sostituzioni). |
| `lineup-form-dialog.tsx` | `LineupFormDialog` | Form per compilare la formazione (titolari e panchina). |
| `import-tuttocampo-dialog.tsx` | `ImportTuttocampoDialog` | Import formazione da Tuttocampo (incolla HTML). |
| `smart-lineup-dialog.tsx` | `SmartLineupDialog` | Generazione formazione intelligente assistita da AI. Supporta logiche di ruolo specifiche per moduli 3-X-X (es. 3-5-2). |

### Dialog Giocatori (`src/components/giocatori/` + `src/components/squadra/`)

| File | Componente | Descrizione |
|---|---|---|
| `squadra/player-form-dialog.tsx` | `PlayerFormDialog` | Form aggiungi/modifica giocatore (Nome, Cognome e Ruolo Tecnico). |
| `giocatori/smart-player-dialog.tsx` | `SmartPlayerDialog` | Importazione massiva giocatori via AI (incolla lista nomi). |
| `giocatori/bulk-player-dialog.tsx` | `BulkPlayerDialog` | Aggiunta giocatori in blocco manualmente. |

### Dialog Allenamento (`src/components/allenamento/`)

| File | Componente | Descrizione |
|---|---|---|
| `training-stats-dialog.tsx` | `TrainingStatsDialog` | Statistiche presenze allenamento della settimana corrente. |

### Dialog Scout (`src/components/scout/`)

| File | Componente | Descrizione |
|---|---|---|
| `scout-player-dialog.tsx` | `ScoutPlayerDialog` | Form aggiungi/modifica talento scouting (nome, ruolo, squadra, note, etichette). |
| `scout-category-dialog.tsx` | `ScoutCategoryDialog` | Gestione etichette/categorie scout (nome + colore). |

### Dialog Inline (definiti dentro le Page)

| Pagina | Tipo | Descrizione |
|---|---|---|
| `allenamento/page.tsx` | `Dialog` | Generatore automatico sessioni (data inizio/fine). |
| `allenamento/page.tsx` | `AlertDialog` ×3 | Elimina singola sessione · Elimina settimana · Reset totale. |
| `membri/page.tsx` | `AlertDialog` | Conferma eliminazione giocatore dalla rosa. |
| `scout/page.tsx` | `AlertDialog` | Conferma eliminazione talento scout. |
| `altro/page.tsx` | `Dialog` | Profilo Allenatore (username + email + logout). |
| `altro/page.tsx` | `Dialog` | Gestione Squadra (durata partite, giorni allenamento, auto-presenze, archivio stagioni). |
| `altro/page.tsx` | `Dialog` | Privacy & Dati (esporta CSV + reset stagione). |
| `altro/page.tsx` | `AlertDialog` | Conferma reset stagione. |
| `altro/page.tsx` | `AlertDialog` | Conferma eliminazione stagione. |

---

## 🃏 Card

| Card | Usata in | Descrizione |
|---|---|---|
| `Prossimo Impegno` | `/` | Card con dettagli della prossima gara in programma. |
| `Azioni Rapide` | `/` | Hub di pulsanti per aggiunta rapida gare, allenamenti e scout. |
| `Wall of Fame` | `/` | Breakdown dei leader stagionali (Gol, Assist, Presenze). |
| Card Riepilogo Partita | `/calendario/[id]` | Mostra risultato (home vs away), data e casa/trasferta. |
| `StatCard` | `/membri/[id]` | Card statistica piccola con icona, label e valore numerico (presenze, gol, assist, ecc.). |
| Card Profilo Tecnico | `/membri/[id]` | Radar chart a 5 assi del profilo del giocatore. |
| Card Risultati Personali | `/membri/[id]` | Bar chart vittorie/pareggi/sconfitte personali. |
| Card Storico Presenze Partite | `/membri/[id]` | Heatmap dot delle presenze nelle partite. |
| Card Storico Presenze Allenamenti | `/membri/[id]` | Heatmap dot delle presenze in allenamento. |
| Card Sessione Allenamento | `/allenamento` | Card cliccabile con data, focus e barra presenze. |
| Card Esercitazioni | `/allenamento/[id]` | Card con form focus + textarea note programma allenamento. |
| Card Giocatore Presenza | `/allenamento/[id]` | Card per ogni giocatore con pulsanti Presente / Ritardo / Assente. |
| Card Talento Scout | `/scout` | Card con nome, ruolo, squadra, note e etichette colorate. |
| Card Vuota (empty state) | `/scout` | Mostrata quando nessun talento corrisponde ai filtri. |
| Card Advanced Stats | `/statistiche` | Card "Muro Difensivo", "Efficiency Index", "Risolutore" e "Amuleto Squadra". |
| Card Muro Difensivo | `/statistiche` | Statistica aggregata coppie/tria difensivi (selezionabile 3 o 4 difensori). |

---

## ❌ Pagine di Errore e Stati "Dati Non Trovati"

### Error Boundary (globale)
| Campo | Valore |
|---|---|
| **File** | `src/app/error.tsx` |
| **Componente** | `Error` |
| **Trigger** | Eccezione non gestita in qualsiasi route figlia |
| **Descrizione** | Schermata di errore a schermo intero. Icona `AlertTriangle`, messaggio d'errore, blocco dettaglio (solo se `error.message` presente) e bottone "Ricarica Pagina". |
| **✅ Tema** | Usa token semantici: `bg-background`, `bg-card`, `text-foreground`, `text-primary`, `border-primary/20`. Light mode: sfondo bianco, scritte nere, bottoni azzurri. Dark mode: sfondo quasi-nero, accenti verde neon. |

---

### Stati Vuoti / Dati Non Trovati (inline nelle pagine)

| Componente / Page | Stato | Messaggio | File |
|---|---|---|---|
| `HomePage` | Nessuna partita | Testo semplice "Nessuna gara in programma" | `src/app/page.tsx` |
| `MatchDetailPage` | Errore caricamento | Icona AlertCircle rosso + "Dettagli non disponibili" + pulsante Riprova | `src/app/calendario/[id]/page.tsx` |
| `PlayerDetailPage` | Giocatore non trovato | Icona User + "Non Trovato" + pulsante torna alla Rosa | `src/app/membri/[id]/page.tsx` |
| `TrainingDetailPage` | Sessione non trovata | Testo semplice "Sessione non trovata" | `src/app/allenamento/[id]/page.tsx` |
| `AllenamentoPage` | Nessuna sessione settimana | Icona Dumbbell + "Nessuna sessione" | `src/app/allenamento/page.tsx` |
| `RosaPage` | Ruolo senza giocatori | "Nessun giocatore in questo ruolo" (in accordion) | `src/app/membri/page.tsx` |
| `ScoutPage` | Nessun talento trovato | Icona Search + "Nessun talento trovato" | `src/app/scout/page.tsx` |
| `TrainingHeatmap` | Nessun allenamento | Testo "Nessun allenamento registrato" in box tratteggiato | `src/app/membri/[id]/page.tsx` |
| `MatchHeatmap` | Nessuna partita | Testo "Nessuna partita in calendario" in box tratteggiato | `src/app/membri/[id]/page.tsx` |

---

## 🎨 Componenti Sensibili al Tema (Light ↔ Dark)

> Legenda priorità:
> - 🔴 **Critico** — usa classi hardcoded senza `dark:` prefix, risulta errato in light mode
> - 🟡 **Medio** — usa `dark:` ma la versione light potrebbe essere migliorata
> - 🟢 **OK** — già gestisce correttamente entrambi i temi

### Pages

| Pagina | File | Priorità | Note |
|---|---|---|---|
| Dashboard | `src/app/page.tsx` | 🟢 | **Risolto** — ora usa `bg-background`, `bg-card` e token semantici. |
| Error Boundary | `src/app/error.tsx` | 🟢 | **Risolto** — ora usa token semantici `bg-background`, `text-foreground`, `text-primary`. |
| Dettaglio Partita | `src/app/calendario/[id]/page.tsx` | 🟢 | Token semantici + `dark:` prefix. |
| Rosa / Membri | `src/app/membri/page.tsx` | 🟢 | Colori per ruolo usano palette adattiva (amber/slate/blue/red con dark: variant). |
| Dettaglio Giocatore | `src/app/membri/[id]/page.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici per grafici. |
| Confronto | `src/app/membri/confronto/page.tsx` | 🟢 | **Risolto** — Integrato `useThemeStore` per grafici e tooltips. |
| Sessioni Allenamento | `src/app/allenamento/page.tsx` | 🟢 | Usa token semantici + `dark:` su tutti gli elementi. |
| Dettaglio Allenamento | `src/app/allenamento/[id]/page.tsx` | 🟢 | Bottoni presenze (verde/giallo/rosso) sono semantici e non cambiano con il tema (intenzionale). |
| Scout | `src/app/scout/page.tsx` | 🟢 | Chip categorie usano colori dinamici da Firestore (hex utente), non dal tema. |
| Statistiche | `src/app/statistiche/page.tsx` | 🟢 | **Risolto** — Tab e Chart (Venue, Goal, Performance) ora adattivi. |
| Impostazioni (Altro) | `src/app/altro/page.tsx` | 🟢 | Toggle tema usa `dark:` prefix correttamente. |

---

### Dialog

| Dialog | File | Priorità | Note |
|---|---|---|---|
| `FullCalendarDialog` | `src/components/partite/full-calendar-dialog.tsx` | 🟢 | **Risolto** — ora usa token semantici per header e bottoni. |
| `MatchFormDialog` | `src/components/partite/match-form-dialog.tsx` | 🟢 | Usa token semantici. |
| `MatchEventDialog` | `src/components/partite/match-event-dialog.tsx` | 🟢 | Usa token semantici. |
| `LineupFormDialog` | `src/components/partite/lineup-form-dialog.tsx` | 🟢 | **Risolto** — rimosso `bg-black`, ora usa `bg-card`. |
| `ImportTuttocampoDialog` | `src/components/partite/import-tuttocampo-dialog.tsx` | 🟢 | **Risolto** — ora usa token semantici. |
| `SmartLineupDialog` | `src/components/partite/smart-lineup-dialog.tsx` | 🟢 | **Risolto** — ora usa token semantici. |
| `PlayerFormDialog` | `src/components/squadra/player-form-dialog.tsx` | 🟢 | Usa token semantici. |
| `SmartPlayerDialog` | `src/components/giocatori/smart-player-dialog.tsx` | 🟢 | **Risolto** — rimosso `bg-black`. |
| `BulkPlayerDialog` | `src/components/giocatori/bulk-player-dialog.tsx` | 🟢 | **Risolto** — rimosso `bg-black`. |
| `TrainingStatsDialog` | `src/components/allenamento/training-stats-dialog.tsx` | 🟢 | **Risolto** — ora usa token semantici. |
| `ScoutPlayerDialog` | `src/components/scout/scout-player-dialog.tsx` | 🟢 | **Risolto** — ora usa token semantici. |
| `ScoutCategoryDialog` | `src/components/scout/scout-category-dialog.tsx` | 🟢 | **Risolto** — ora usa token semantici. |
| `AlertDialog` (globale) | `src/components/ui/alert-dialog.tsx` | 🟢 | Componente shadcn/ui — usa token semantici. |
| `Dialog` (globale) | `src/components/ui/dialog.tsx` | 🟢 | Componente shadcn/ui — usa token semantici. |
| Dialog Profilo Allenatore | `src/app/altro/page.tsx` | 🟢 | Usa `bg-background` + token semantici. |
| Dialog Gestione Squadra | `src/app/altro/page.tsx` | 🟢 | Usa `bg-background` + token semantici. |
| Dialog Privacy & Dati | `src/app/altro/page.tsx` | 🟢 | Usa `bg-background` + token semantici. |

---

### Card e Componenti Statistiche

| Componente | File | Priorità | Note |
|---|---|---|---|
| `TeamRecord` | `src/components/statistiche/team-record.tsx` | 🟢 | **Risolto** — rimosso `bg-black` e bordi hardcoded. |
| `PlayerLeaderboard` | `src/components/statistiche/player-leaderboard.tsx` | 🟢 | **Risolto** — ora usa token semantici per la tabella. |
| `VenueStatsCharts` (Pie) | `src/components/statistiche/venue-stats-charts.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici e tooltip adattivo. |
| `GoalVenueCharts` (Pie) | `src/components/statistiche/goal-venue-charts.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici e tooltip adattivo. |
| `TeamPerformanceChart` (Line) | `src/components/statistiche/team-performance-chart.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici per linee, grid e tooltip. |
| `GoalsIntervalChart` (Pie) | `src/components/statistiche/goals-interval-chart.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici. |
| `RadarChart` (inline) | `src/app/membri/[id]/page.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici per grid, fill e tooltip. |
| `BarChartComponent` (inline) | `src/app/membri/[id]/page.tsx` | 🟢 | **Risolto** — ora usa `useThemeStore` + colori dinamici. |
| Card Sessione Allenamento | `src/app/allenamento/page.tsx` | 🟢 | Usa `dark:` prefix su tutte le classi. |
| Card Talento Scout | `src/app/scout/page.tsx` | 🟢 | Usa token semantici. |

---

### Layout

| Componente | File | Priorità | Note |
|---|---|---|---|
| `AppHeader` | `src/components/layout/app-header.tsx` | 🟢 | **Risolto** — ora usa token semantici per sfondo e nav states. |
| `BottomNav` | `src/components/layout/bottom-nav.tsx` | 🟢 | **Risolto** — rimosso `bg-black` per il contenitore. |
| `AuthGuard` | `src/components/layout/auth-guard.tsx` | 🟢 | **Risolto** — ora usa `bg-background` e `dark:bg-black` per lo splash screen di caricamento. |

---

### Riepilogo Interventi Prioritari

| # | Componente | Stato | Azione Solutiva |
|---|---|---|---|
| 1 | `error.tsx` | Risolto | Sostituiti colori hardcoded con token semantici |
| 2 | `VenueStatsCharts` | Risolto | Implementati colori dinamici via `useThemeStore` |
| 3 | `GoalVenueCharts` | Risolto | Implementati colori dinamici via `useThemeStore` |
| 4 | `TeamPerformanceChart` | Risolto | Implementati colori dinamici via `useThemeStore` |
| 5 | `GoalsIntervalChart` | Risolto | Implementati colori dinamici via `useThemeStore` |
| 6 | `RadarChart` (PlayerDetail) | Risolto | Implementati colori dinamici via `useThemeStore` |
| 7 | `BarChartComponent` (PlayerDetail) | Risolto | Implementati colori dinamici via `useThemeStore` |
| 8 | `page.tsx` (Dashboard) | Risolto | Sostituiti colori hardcoded con token semantici |

---

## 🧭 Componenti Layout

| File | Componente | Descrizione |
|---|---|---|
| `layout/app-header.tsx` | `AppHeader` | Header superiore dell'app con logo e azioni contestuali. |
| `layout/bottom-nav.tsx` | `BottomNav` | Navigazione inferiore a tab (Dashboard · Membri · Allenamento · Scout · Altro). |
| `layout/page-header.tsx` | `PageHeader` | Header di pagina riutilizzabile con titolo e slot per azioni. |
| `layout/auth-guard.tsx` | `AuthGuard` | HOC che protegge le route richiedendo l'autenticazione. |
| `layout/theme-provider.tsx` | `ThemeProvider` | Provider per il tema dark/light. |
| `layout/guide-dialog.tsx` | `GuideDialog` | Dialog di onboarding e guida rapida alle funzionalità dell'app. |
