import 'server-only';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import dotenv from 'dotenv';

// Carica variabili d'ambiente per contesti fuori da Next.js (es. Genkit CLI)
dotenv.config({ path: '.env.local' });

/**
 * Pulisce la chiave API rimuovendo eventuali virgolette o spazi aggiunti accidentalmente dall'utente.
 */
const cleanKey = (key?: string) => key?.replace(/['"]/g, '').trim();

const apiKey = cleanKey(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY);

if (process.env.NODE_ENV !== 'production') {
  console.log('[Genkit] API Key found:', !!apiKey, 'Prefix:', apiKey?.substring(0, 7) + '...');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
      apiVersion: 'v1beta'
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});
