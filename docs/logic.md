# Logiche di Inserimento Eventi Live con Tasti Veloci

Documento tecnico per definire le possibili implementazioni di inserimento rapido degli eventi durante una partita live in PitchMan.

---

## Proposta 1: Logica a Catena (Vim-Style)
Questa logica si basa sulla memorizzazione di sequenze brevi di tasti che corrispondono a `[Tipo Evento] + [Numero Maglia] + [Invio]`.

### Funzionamento
1. **Attivazione**: L'utente preme un tasto trigger globale (es. `Spazio` o `/`) per "ascoltare" la sequenza.
2. **Sequenza**:
   - `g` -> Goal
   - `y` -> Ammonizione (Yellow)
   - `r` -> Espulsione (Red)
   - `s` -> Sostituzione
   - `k` -> Occasione (Chance)
   - `p` -> Palo/Traversa
3. **Dettaglio**: Subito dopo il tipo, l'utente digita il numero di maglia.
4. **Conferma**: Premendo `Invio`, l'evento viene registrato al minuto corrente.

**Esempio**: `g` + `10` + `Invio` registra un gol per il numero 10.
**Vantaggi**: Velocità assoluta per utenti esperti; non richiede l'uso del mouse.
**Svantaggi**: Richiede che i numeri di maglia siano configurati e visibili.

---

## Proposta 2: Palette di Comando (Spotlight/Raycast)
Utilizza un'interfaccia di ricerca intelligente che appare al centro dello schermo.

### Funzionamento
1. **Attivazione**: Scorciatoia `Cmd+K` (Mac) o `Ctrl+K` (Windows).
2. **Input**: L'utente inizia a scrivere il tipo di evento o il nome del giocatore.
3. **Autocompletamento**: Il sistema suggerisce gli eventi più probabili.
   - Es: Scrivendo "go" appare "Goal".
   - Premendo `Tab`, il focus passa alla selezione del giocatore (filtrata per chi è in campo).
4. **Modifica Rapida**: Se l'evento è avvenuto qualche minuto prima, si può aggiungere `-2` alla fine della stringa per sottrarre minuti dal tempo corrente.

**Esempio**: `/goal Totti -1` registra un gol di Totti avvenuto un minuto fa.
**Vantaggi**: Molto intuitivo; riduce la necessità di ricordare codici; flessibile per aggiungere note.
**Svantaggi**: Richiede più battute rispetto alla logica a catena.

---

## Proposta 3: Mappatura a Matrice (Keypad Mapping)
Sfrutta il tastierino numerico o una griglia di tasti predefiniti per mappare le posizioni in campo o i tipi di evento.

### Funzionamento
1. **Mappatura Eventi**: I tasti `1-6` della fila superiore o del tastierino numerico sono mappati agli eventi principali:
   - `1`: Goal
   - `2`: Ammonizione
   - `3`: Espulsione
   - `4`: Sostituzione
   - `5`: Palo
   - `6`: Occasione
2. **Mappatura Giocatori**: All'attivazione di un tasto evento, i giocatori in campo vengono evidenziati con una lettera (A, S, D, F, G...).
3. **Esecuzione**: Premere il numero dell'evento e poi la lettera del giocatore.

**Esempio**: Premere `1` (Goal) e poi `F` (corrispondente all'attaccante centrale evidenziato a video).
**Vantaggi**: Altamente visuale; permette di registrare eventi con soli due tocchi; ideale per chi lavora con una mano sulla tastiera.
**Svantaggi**: Richiede una sovrapposizione visiva (overlay) sui nomi dei giocatori durante la selezione.

---

## Confronto e Raccomandazione

| Caratteristica | Logica a Catena | Palette di Comando | Mappatura a Matrice |
| :--- | :--- | :--- | :--- |
| **Velocità** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Facilità d'uso** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Precisione** | Elevata (Numeri) | Massima (Nomi) | Media (Posizioni) |

**Raccomandazione**: Per PitchMan, la **Proposta 2 (Palette)** è la più bilanciata per il mercato generalista, ma l'integrazione di una **"Modalità Esperto"** basata sulla **Proposta 1** offrirebbe il massimo valore per i match analisti professionisti.
