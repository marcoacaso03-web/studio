'use server';
/**
 * @fileOverview Flusso AI per l'importazione del calendario da Tuttocampo.
 *
 * Supporta sia l'importazione tramite URL (scraping) che tramite testo incollato manualmente.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImportMatchesInputSchema = z.object({
  url: z.string().url().optional().describe('L\'URL della pagina Calendario.'),
  rawContent: z.string().optional().describe('Il contenuto testuale o HTML copiato manualmente dall\'utente.'),
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
  teamName: z.string().describe('Il nome della squadra principale identificata.'),
});
export type ImportMatchesOutput = z.infer<typeof ImportMatchesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importMatchesPrompt',
  input: { schema: z.object({ content: z.string(), source: z.string() }) },
  output: { schema: ImportMatchesOutputSchema },
  prompt: `Sei un esperto di analisi dati sportivi. Ti è stato fornito un frammento di dati (HTML o Testo copiato) proveniente da Tuttocampo (Fonte: {{source}}).
  
Il tuo compito è:
1. Identificare la squadra principale (quella di cui si sta guardando il calendario).
2. Estrarre TUTTE le partite.
3. Per ogni partita, determina:
   - Avversario (l'altra squadra).
   - Data e ora (usa l'anno corrente 2024/25 se non specificato). Default ora: 15:00.
   - Casa/Trasferta per la squadra principale.

Dati forniti:
{{{content}}}`,
});

export async function importMatchesFromUrl(input: ImportMatchesInput): Promise<ImportMatchesOutput> {
  return importMatchesFlow(input);
}

const cleanContent = (text: string) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 30000);
};

const importMatchesFlow = ai.defineFlow(
  {
    name: 'importMatchesFlow',
    inputSchema: ImportMatchesInputSchema,
    outputSchema: ImportMatchesOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Configurazione Mancante: Chiave API non trovata.');

    let contentToAnalyze = '';
    let source = 'Testo Incollato';

    if (input.rawContent) {
      contentToAnalyze = cleanContent(input.rawContent);
    } else if (input.url) {
      source = input.url;
      try {
        const response = await fetch(input.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Referer': 'https://www.tuttocampo.it/',
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Il sito ha risposto con errore ${response.status}. Usa la modalità "Copia-Incolla" manuale.`);
        }

        const html = await response.text();
        contentToAnalyze = cleanContent(html);
      } catch (error: any) {
        throw new Error(error.message || 'Errore di connessione al sito.');
      }
    } else {
      throw new Error('Fornire un URL o il contenuto testuale.');
    }

    const { output } = await prompt({ content: contentToAnalyze, source });
    if (!output || !output.matches) throw new Error('Impossibile estrarre le gare.');

    return output;
  }
);
