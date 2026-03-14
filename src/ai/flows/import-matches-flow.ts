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
  date: z.string().describe('La data e ora della partita in formato ISO o stringa leggibile (es. YYYY-MM-DDTHH:mm).'),
  isHome: z.boolean().describe('Vero se la squadra dell\'utente gioca in casa.'),
  type: z.enum(['Campionato', 'Torneo', 'Amichevole']).default('Campionato'),
});

const ImportMatchesOutputSchema = z.object({
  matches: z.array(MatchSchema),
  teamName: z.string().describe('Il nome della squadra identificata come principale.'),
});
export type ImportMatchesOutput = z.infer<typeof ImportMatchesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importMatchesPrompt',
  input: { schema: z.object({ html: z.string(), url: z.string() }) },
  output: { schema: ImportMatchesOutputSchema },
  prompt: `Sei un esperto di analisi dati sportivi. Ti è stato fornito l'HTML di una pagina Calendario di Tuttocampo (URL: {{url}}).
  
Il tuo compito è:
1. Identificare qual è la squadra principale di cui si sta visualizzando il calendario (quella a cui si riferisce l'URL).
2. Estrarre tutte le partite future e passate elencate nella tabella.
3. Per ogni partita, determina:
   - Chi è l'avversario.
   - La data e l'ora (se l'orario manca, usa 15:00 come default).
   - Se la squadra principale gioca in casa o fuori.

Restituisci i dati in modo strutturato. Se non trovi partite, restituisci un array vuoto.

HTML della pagina:
{{{html}}}`,
});

export async function importMatchesFromUrl(input: ImportMatchesInput): Promise<ImportMatchesOutput> {
  return importMatchesFlow(input);
}

const importMatchesFlow = ai.defineFlow(
  {
    name: 'importMatchesFlow',
    inputSchema: ImportMatchesInputSchema,
    outputSchema: ImportMatchesOutputSchema,
  },
  async (input) => {
    try {
      const response = await fetch(input.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error('Impossibile raggiungere il sito di Tuttocampo.');
      }

      const html = await response.text();
      // Truncheggiamo l'HTML per non eccedere i limiti di token se necessario, 
      // ma proviamo prima con il contenuto intero o le parti rilevanti.
      const relevantHtml = html.substring(html.indexOf('<table'), html.lastIndexOf('</table>') + 8);

      const { output } = await prompt({ html: relevantHtml, url: input.url });
      
      if (!output) {
        throw new Error('L\'AI non è riuscita a estrarre dati validi dalla pagina.');
      }

      return output;
    } catch (error: any) {
      console.error('Import flow error:', error);
      throw new Error(error.message || 'Errore durante l\'importazione dei dati.');
    }
  }
);
