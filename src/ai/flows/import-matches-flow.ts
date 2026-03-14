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
  prompt: `Sei un esperto di analisi dati sportivi. Ti è stato fornito l'HTML (pulito) di una pagina Calendario di Tuttocampo (URL: {{url}}).
  
Il tuo compito è:
1. Identificare qual è la squadra principale di cui si sta visualizzando il calendario. Guarda con attenzione l'URL per capire di quale squadra si tratta (solitamente è la parte finale del path prima dell'ID).
2. Estrarre TUTTE le partite elencate nelle tabelle del calendario (sia passate che future).
3. Per ogni partita, determina con precisione:
   - Chi è l'avversario (l'ALTRA squadra rispetto a quella principale).
   - La data e l'ora. Nota: Spesso le date sono scritte come "Dom 24/02" o simile. Interpreta l'anno correttamente basandoti sulla stagione sportiva corrente (es: 2025).
   - Se la squadra principale gioca in casa (prima nella lista) o fuori (seconda nella lista).

Restituisci i dati in modo strutturato. Sii molto preciso sui nomi delle squadre.

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
    .replace(/<!--[\s\S]*?-->/g, '')                             // Rimuove commenti
    .replace(/\s+/g, ' ')                                        // Comprime spazi
    .trim();
};

const extractTableHtml = (html: string) => {
  const tableIndex = html.indexOf('<table');
  const lastTableIndex = html.lastIndexOf('</table>');
  if (tableIndex === -1 || lastTableIndex === -1) return html;
  return html.substring(tableIndex, lastTableIndex + 8);
};

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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`Impossibile raggiungere il sito: ${response.statusText}`);
      }

      const rawHtml = await response.text();
      const cleanedHtml = cleanHtml(extractTableHtml(rawHtml));

      const { output } = await prompt({ html: { content: cleanedHtml }, url: input.url });
      
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