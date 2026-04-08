import 'server-only';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Pulisce la chiave API rimuovendo eventuali virgolette o spazi aggiunti accidentalmente dall'utente.
 */
const cleanKey = (key?: string) => key?.replace(/['"]/g, '').trim();

const apiKey = cleanKey(process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey || 'missing-key' // Evita crash durante l'inizializzazione del plugin
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
