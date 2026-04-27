# 📊 STATS.md — Piano Statistiche PitchMan

> Ispirato alle statistiche avanzate di Football Manager 24/26, adattato ai dati realmente disponibili nell'app.

---

## ✅ Dati Disponibili

Dalla struttura del modello dati (`types.ts`), sono disponibili i seguenti dati grezzi:

| Entità | Dati Disponibili |
|---|---|
| **Match** | Data, avversario, casa/trasferta, tipo (campionato/torneo/amichevole), risultato, stato (completed/scheduled/canceled), giornata, durata |
| **MatchEvent** | Tipo (goal, assist, giallo, rosso, sostituzione), minuto, tempo (1T/2T/TS), giocatore, lato (nostro/avversario) |
| **MatchLineup** | Titolari, riserve, formazione (modulo) |
| **MatchAttendance** | Presenza per singola partita (presente/assente/in dubbio) |
| **PlayerMatchStats** | Minuti giocati, gol, assist, gialli, rossi per partita |
| **Player** | Ruolo principale, ruoli secondari |
| **TrainingSession** | Data, presenze, focus, note |
| **TrainingAttendance** | Stato presenza allenamento (presente/ritardo/assente) |

---

## 🏆 Statistiche Squadra (Ispirate a FM)

### 1. Andamento Stagionale ✅ *implementato*
| Metrica | Formula | Fonte |
|---|---|---|
| Partite giocate | `COUNT(matches WHERE status=completed)` | Match |
| Vittorie / Pareggi / Sconfitte | `COUNT(resultType = W/D/L)` | Match |
| Gol fatti / subiti | `SUM(teamGoals)` / `SUM(opponentGoals)` | Match |
| Differenza reti | `teamGoals - opponentGoals` | Match |
| Punti totali | `W×3 + D×1` | Match |
| Media gol fatti/subiti per partita | `total / matchesPlayed` | Match |

### 2. Rendimento Casa vs Trasferta ✅ *implementato*
| Metrica | Formula | Fonte |
|---|---|---|
| W/D/L in casa | Filtra `isHome = true` | Match |
| W/D/L in trasferta | Filtra `isHome = false` | Match |
| Media gol casa vs trasferta | Separato per `isHome` | Match |

### 3. Per Tipo di Competizione ⬜ *da implementare*
- Campionato vs Torneo vs Amichevole
- Punti, gol, rendimento separati per `type`

### 4. Striscia di Risultati ⬜ *da implementare*
| Metrica | Descrizione |
|---|---|
| Striscia positiva | Max partite consecutive senza sconfitta |
| Striscia negativa | Max partite consecutive senza vittoria |
| Forma recente | Ultimi 5 risultati (es. W-D-W-L-W) |

### 5. Performance per Minuto ✅ *implementato*
- Gol segnati nel 1° tempo vs 2° tempo
- Gol subiti per fascia oraria (0-15', 16-30', 31-45', ecc.)
- "Rimonte effettuate" (partite vinte da posizione di svantaggio)

---

## 👤 Statistiche Individuali (Ispirate a FM)

### 6. Statistiche Base Giocatore ✅ *implementato*
| Metrica | Formula |
|---|---|
| Presenze totali | `COUNT(appearances)` |
| Gol | `SUM(goals)` |
| Assist | `SUM(assists)` |
| Cartellini gialli | `SUM(yellowCards)` |
| Cartellini rossi | `SUM(redCards)` |
| Minuti medi | `AVG(minutesPlayed)` |

### 7. Statistiche Avanzate Giocatore ✅ *implementato*
| Metrica | Formula | Note |
|---|---|---|
| G/A per partita da titolare | `(goals+assists) / starterApps` | Efficiency Index |
| Gol decisivi | Algoritmo timeline | Risolutore |
| Tasso sconfitta da titolare | `losses / starterApps` | Amuleto Squadra |
| Gol per 90 minuti | `goals / (minutesPlayed / 90)` | ⬜ *da aggiungere* |
| Assist per 90 minuti | `assists / (minutesPlayed / 90)` | ⬜ *da aggiungere* |
| Contributo offensivo (G+A) per 90' | `(goals+assists) / (minutesPlayed / 90)` | ⬜ *da aggiungere* |

### 8. Affidabilità e Continuità ✅ *implementato*
| Metrica | Formula | Ispirazione FM |
|---|---|---|
| % partite da titolare | `starterApps / appearances` | "Starter Rate" |
| % partite da subentrato | `subApps / appearances` | "Sub Rate" |
| Minuti totali stagione | `SUM(minutesPlayed)` | - |
| Partite complete (90') | `COUNT(minutesPlayed >= 90)` | - |
| Contributo totale (G+A) | `goals + assists` | - |
| Disciplina | `yellowCards + (redCards × 2)` | Indice disciplinare |

### 9. Impatto in Esito delle Partite ✅ *implementato*
| Metrica | Descrizione | Ispirazione FM |
|---|---|---|
| Win Rate da titolare | `W / starterApps` | FM: "Win % when starting" |
| Win Rate da subentrato | `W / subApps` | FM: "Win % when subbed in" |
| Gol segnati in partite vinte | Correlazione risultato-goler | - |
| Partite in cui ha segnato = vittoria | Count | "Winning goal scorer" |

---

## 🛡️ Statistiche Difensive (Ispirate a FM)

### 10. Coppia Difensiva (Muro Difensivo) ✅ *implementato*
| Metrica | Formula |
|---|---|
| Gol subiti insieme (coppia) | `SUM(opponentGoals)` nelle partite giocate insieme |
| Media gol subiti per partita | `goalsConceded / matchesTogether` |
| Trio difensivo | Stesso calcolo per 3 difensori |

### 11. Solidità Difensiva ✅ *parzialmente implementato*
| Metrica | Formula | Ispirazione FM |
|---|---|---|
| Clean sheet portiere/difensori | `COUNT(matches WHERE opponentGoals=0 AND player started)` | FM: "Clean Sheets" |
| Media gol subiti con giocatore in campo | `opponentGoals / matchesTogether` | Per ogni titolare |
| Differenza reti con/senza giocatore | Comparazione | FM: "Impact metric" |

---

## 📅 Statistiche Presenze & Affidabilità

### 12. Presenze Allenamento ⬜ *da implementare*
| Metrica | Formula |
|---|---|
| % presenze allenamenti | `presente / total` |
| % ritardi | `ritardo / total` |
| % assenze | `assente / total` |
| Trend presenza (ultimi 4) | Ultimi 4 allenamenti |

### 13. Presenze Partite ⬜ *da implementare*
| Metrica | Formula |
|---|---|
| % convocazioni su partite | `appearances / totalMatches` |
| Partite saltate (assente/infortunio) | `COUNT(attendance = assente)` |

---

## 🤖 Statistiche AI/Suggerimento (Futuribili)

> Richiedono elaborazione incrociata dei dati

| Statistica | Descrizione |
|---|---|
| Coppia più prolifica | Duo attaccante/trequartista con più G+A insieme |
| Modulo più efficace | Formazione con miglior win rate |
| "Firma" temporale | Minuto medio del primo gol stagionale |
| "Home advantage" reale | Delta performance casa/trasferta |
| Top performer sub | Giocatori con più impatto da subentrante |

---

## 🗺️ Roadmap Implementazione Consigliata

```
Priorità ALTA (calcoli con dati già disponibili)
├── Gol/Assist per 90 minuti
├── Clean Sheet per difensore/portiere (backend update)
├── Striscia di forma recente (ultimi 5)
└── Dashboard Punti per competizione

Priorità MEDIA
├── Presenze allenamento %
├── Disciplina (indice)
└── Trend presenza allenamento (grafico)

Priorità BASSA (più complesse)
├── Rimonte effettuate (logica evento)
├── Coppia offensiva più prolifica
└── Modulo più efficace (ranking win rate)
```

---

> **Nota**: Tutte le statistiche contrassegnate ✅ sono già implementate o parzialmente disponibili. Quelle ⬜ richiedono nuovi componenti/calcoli lato repository.
