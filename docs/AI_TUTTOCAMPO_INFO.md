
# Integrazione AI — Importazione Tuttocampo

Questo documento spiega come PitchMan utilizza l'intelligenza artificiale per l'importazione automatica del calendario.

## 🤖 Modello e API
L'applicazione utilizza **Genkit** con il plugin **Google AI**.
- **Modello**: `googleai/gemini-2.5-flash`
- **Perché**: Abbiamo scelto il modello Flash per la sua bassa latenza e la capacità di gestire finestre di contesto ampie (essenziale per leggere interi frammenti di tabelle HTML).

## 🛠️ Architettura del Flusso
Il processo di importazione segue questi step:
1. **Scraping**: L'app effettua una richiesta `fetch` server-side all'URL di Tuttocampo fornito dall'utente.
2. **Cleaning**: L'HTML viene pulito rimuovendo tag `<script>`, `<style>`, `<svg>` e commenti. Questo riduce il consumo di token e migliora la precisione dell'AI focalizzandola solo sui dati testuali.
3. **Analisi AI**: Il testo viene inviato a Gemini con un prompt strutturato che definisce lo schema di output (JSON).
4. **Validazione**: I dati restituiti dall'AI vengono validati tramite **Zod** prima di essere salvati nel database.

## 👥 Accesso per gli Utenti
Questo metodo è **universale** e non richiede configurazioni da parte del singolo utente:
- **Server Action**: Poiché il codice gira sul server, l'utente non ha bisogno di una chiave API propria.
- **Sincronizzazione Cloud**: Una volta importate, le partite sono immediatamente disponibili su tutti i dispositivi dell'utente grazie a Firebase Firestore.
- **Limiti**: L'uso è limitato dalle quote della chiave API configurata nel file `.env` dell'host (Google AI API Key).

## 📈 Scalabilità e Costi
Gemini 2.5 Flash offre un piano gratuito generoso (fino a 15 richieste al minuto). Per un uso gestionale interno, questo copre ampiamente le necessità di centinaia di allenatori senza costi aggiuntivi.
