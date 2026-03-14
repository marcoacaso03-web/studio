
# Integrazione AI — Importazione Tuttocampo

Questo documento spiega come PitchMan utilizza l'intelligenza artificiale per l'importazione automatica del calendario e come configurarla correttamente.

## 🤖 Modello e API
L'applicazione utilizza **Genkit** con il plugin **Google AI**.
- **Modello**: `googleai/gemini-2.5-flash`
- **Perché**: Abbiamo scelto il modello Flash per la sua bassa latenza e la capacità di gestire finestre di contesto ampie (essenziale per leggere interi frammenti di tabelle HTML).

## 🔑 Configurazione Chiave API
Per far funzionare l'importazione, devi configurare la chiave API nel tuo ambiente di hosting o nel file locale.

**Dove incollare la chiave?**
Devi aggiungere questa riga nel tuo file `.env` (nella root del progetto):

```env
GOOGLE_GENAI_API_KEY=La_Tua_Chiave_Qui
```

*Nota: Puoi ottenere una chiave gratuita su [Google AI Studio](https://aistudio.google.com/).*

## 🛠️ Architettura del Flusso
Il processo di importazione segue questi step:
1. **Scraping**: L'app effettua una richiesta `fetch` server-side all'URL di Tuttocampo fornito dall'utente.
2. **Cleaning**: L'HTML viene pulito rimuovendo tag `<script>`, `<style>`, `<svg>` e commenti. Questo riduce il consumo di token e migliora la precisione dell'AI.
3. **Analisi AI**: Il testo viene inviato a Gemini con un prompt strutturato che definisce lo schema di output (JSON).
4. **Validazione**: I dati restituiti dall'AI vengono validati tramite **Zod** prima di essere salvati nel database.

## 👥 Accesso per gli Utenti
Questo metodo è **universale** e non richiede configurazioni da parte del singolo utente:
- **Server Action**: Il codice gira sul server, quindi l'utente finale non ha bisogno di una propria chiave API.
- **Trasparenza**: L'utente incolla il link e l'app usa la chiave centralizzata configurata dall'amministratore.

## 📈 Stato Attuale
- **Codice**: ✅ Già implementato e pronto.
- **Funzionamento**: ⚠️ Richiede la chiave `GOOGLE_GENAI_API_KEY` per rispondere. Senza chiave, il sistema restituirà un errore di autenticazione durante l'importazione.
