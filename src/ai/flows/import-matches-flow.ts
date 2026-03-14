'use server';
/**
 * @fileOverview Flusso AI per l'importazione del calendario da Tuttocampo.
 *
 * - importMatchesFromUrl - Funzione che scarica l'HTML e lo analizza tramite LLM.
 * - ImportMatchesInput - Schema di input (URL).
 * - ImportMatchesOutput - Schema di output (Lista di partite strutturate).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImportMatchesInputSchema = z.object({
  url: z.string().url().describe('L\'URL della pagina Calendario di una squadra su Tuttocampo.'),
});
export type ImportMatchesInput = z.infer<typeof ImportMatchesInputSchema>;

const MatchSchema = z.object({
  opponent: z.string().describe('Il nome della squadra avversaria.'),
  date: z.string().describe('La data e ora della partita in formato ISO o stringa leggibile (es. YYYY-MM-DDTHH:mm). Se manca l\'orario usa 15:00.'),
  isHome: z.boolean().describe('Vero se la squadra dell\'utente gioca in casa.'),
  type: z.enum(['Campionato', 'Torneo', 'Amichevole']).default('Campionato'),
});

const ImportMatchesOutputSchema = z.object({
  matches: z.array(MatchSchema),
  teamName: z.string().describe('Il nome della squadra identificata come principale (quella indicata nel link).'),
});
export type ImportMatchesOutput = z.infer<typeof ImportMatchesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importMatchesPrompt',
  input: { schema: z.object({ html: z.object({ content: z.string() }), url: z.string() }) },
  output: { schema: ImportMatchesOutputSchema },
  prompt: `Sei un esperto di analisi dati sportivi. Ti è stato fornito l'HTML (estratto dalle tabelle) di una pagina Calendario di Tuttocampo (URL: {{url}}).
  
Il tuo compito è:
1. Identificare qual è la squadra principale di cui si sta visualizzando il calendario. Guarda l'URL per capire di quale squadra si tratta.
2. Estrarre TUTTE le partite elencate nelle tabelle (passate e future).
3. Per ogni partita, determina:
   - Chi è l'avversario (l'ALTRA squadra rispetto a quella principale).
   - La data e l'ora. Interpreta l'anno correttamente (es. 2024/2025). Se l'orario non è presente, usa 15:00.
   - Se la squadra principale gioca in casa (prima nella lista) o fuori (seconda nella lista).

Restituisci i dati in modo strutturato JSON.

HTML della pagina:
{{{html.content}}}`,
});

export async function importMatchesFromUrl(input: ImportMatchesInput): Promise<ImportMatchesOutput> {
  return importMatchesFlow(input);
}

const cleanHtml = (html: string) => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Rimuove script
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Rimuove stili
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')     // Rimuove SVG
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Rimuove iframe
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*\/>/gi, '') // Rimuove link CSS
    .replace(/<!--[\s\S]*?-->/g, '')                             // Rimuove commenti
    .replace(/\s+/g, ' ')                                        // Comprime spazi
    .trim();
};

const extractTableHtml = (html: string) => {
  // Cerchiamo le tabelle con classe 'table-calendario' o simili tipiche di Tuttocampo
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const matches = html.match(tableRegex);
  if (!matches) return html.substring(0, 10000); // Fallback se non trova tabelle
  
  // Prendiamo solo le tabelle che sembrano contenere dati del calendario (evitiamo sidebar)
  return matches
    .filter(t => t.toLowerCase().includes('giornata') || t.toLowerCase().includes('vs'))
    .join('\n')
    .substring(0, 25000); // Limite di sicurezza per i token
};

const importMatchesFlow = ai.defineFlow(
  {
    name: 'importMatchesFlow',
    inputSchema: ImportMatchesInputSchema,
    outputSchema: ImportMatchesOutputSchema,
  },
  async (input) => {
    // Verifica flessibile della chiave API (controlla entrambi i nomi possibili)
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Configurazione Mancante: La chiave API di Google non è stata trovata. Assicurati che nel file .env sia presente GOOGLE_GENAI_API_KEY=LaTuaChiave (senza virgolette). Riavvia il server dopo la modifica.');
    }

    try {
      const response = await fetch(input.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.tuttocampo.it/',
        },
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 500) {
          throw new Error(`Il sito Tuttocampo ha bloccato la richiesta (Codice ${response.status}). Prova a riavviare il server dell'app.`);
        }
        throw new Error(`Impossibile raggiungere il sito: ${response.status} ${response.statusText}`);
      }

      const rawHtml = await response.text();
      const cleanedHtml = cleanHtml(extractTableHtml(rawHtml));

      if (cleanedHtml.length < 100) {
        throw new Error('La pagina non sembra contenere un calendario valido o è protetta da sistemi anti-bot avanzati.');
      }

      const { output } = await prompt({ html: { content: cleanedHtml }, url: input.url });
      
      if (!output || !output.matches) {
        throw new Error('L\'AI non è riuscita a estrarre dati validi. Verifica che il link sia corretto e contenga il calendario.');
      }

      return output;
    } catch (error: any) {
      console.error('Import flow error:', error);
      throw new Error(error.message || 'Errore imprevisto durante l\'analisi del link.');
    }
  }
);
