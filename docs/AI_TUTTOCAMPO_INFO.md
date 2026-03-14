# Integrazione AI — Importazione Tuttocampo

Questo documento spiega come PitchMan utilizza l'intelligenza artificiale per l'importazione automatica del calendario tramite il metodo "Copia-Incolla".

## 🤖 Modello e API
L'applicazione utilizza **Genkit** con il plugin **Google AI**.
- **Modello**: `googleai/gemini-2.5-flash`
- **Perché**: Abbiamo scelto il modello Flash per la sua capacità di analizzare grandi quantità di testo (HTML o tabelle testuali) con estrema precisione e bassa latenza.

## 🔑 Configurazione Chiave API
Affinché l'AI possa funzionare, l'amministratore deve configurare la chiave API nel file `.env` del server.

**Formato corretto nel file `.env`:**
```env
GOOGLE_GENAI_API_KEY=Tua_Chiave_Senza_Virgolette
```
*Nota: Puoi ottenere una chiave gratuita su [Google AI Studio](https://aistudio.google.com/).*

## 🛠️ Funzionamento del Metodo "Copia-Incolla"
Data la complessità dei blocchi anti-bot sui siti sportivi, abbiamo optato per il metodo più affidabile:
1. **Selezione Manuale**: L'utente apre la pagina del calendario su Tuttocampo.
2. **Copia Totale**: L'utente seleziona tutto il contenuto della pagina (CTRL+A su PC o "Seleziona Tutto" su Mobile) e lo copia.
3. **Analisi AI**: Il testo viene incollato nell'app. PitchMan pulisce il testo da script e stili inutili e invia i dati a Gemini.
4. **Parsing Intelligente**: L'AI riconosce la squadra principale, estrae avversari, date (anche se scritte in formati colloquiali), orari e determina se la gara è in casa o trasferta.
5. **Salvataggio Massivo**: I dati validati vengono salvati in un'unica operazione batch su Firestore.

## 👥 Perché questo metodo è migliore dello scraping diretto?
- **Affidabilità**: Non fallisce mai a causa di blocchi del server (HTTP 403 o 500).
- **Universalità**: Funziona su qualsiasi girone o categoria di Tuttocampo.
- **Privacy**: Solo l'utente decide quali dati incollare.
- **Velocità**: L'analisi del testo è molto più rapida rispetto al download di un'intera pagina web esterna da parte del server.

## 📈 Troubleshooting
Se l'importazione fallisce:
- Assicurati che nel box sia presente almeno la riga con le intestazioni della tabella (Data, Ora, Squadra A, Squadra B).
- Verifica che la chiave `GOOGLE_GENAI_API_KEY` sia configurata correttamente e che il server sia stato riavviato.
