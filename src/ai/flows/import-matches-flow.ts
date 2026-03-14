'use server';
/**
 * @fileOverview Flusso AI per l'importazione del calendario tramite Copia-Incolla.
 *
 * Utilizza l'AI per estrarre partite strutturate da testo grezzo copiato da Tuttocampo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImportMatchesInputSchema = z.object({
  rawContent: z.string().describe('Il contenuto testuale o HTML copiato manualmente dall\'utente dal sito Tuttocampo.'),
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
  teamName: z.string().describe('Il nome della squadra principale identificata nel calendario.'),
});
export type ImportMatchesOutput = z.infer<typeof ImportMatchesOutputSchema>;

const prompt = ai.definePrompt({
  name: 'importMatchesPrompt',
  input: { schema: z.object({ content: z.string() }) },
  output: { schema: ImportMatchesOutputSchema },
  prompt: `Sei un esperto di analisi dati sportivi. Ti è stato fornito un frammento di testo (HTML o Testo semplice) copiato da una tabella del sito Tuttocampo.
  
Il tuo compito è analizzare il testo e:
1. Identificare la squadra principale del calendario (quella che appare in quasi tutte le righe).
2. Estrarre TUTTE le partite presenti nel testo.
3. Per ogni partita, determina:
   - Avversario (l'altra squadra).
   - Data e ora (usa l'anno corrente 2024/25 se non specificato). Se l'orario non è presente, imposta 15:00.
   - Casa/Trasferta: Determina se la squadra principale gioca in casa (primo nome nella riga) o trasferta (secondo nome).

Dati forniti dal "Copia-Incolla":
{{{content}}}`,
});

export async function importMatchesFromText(input: ImportMatchesInput): Promise<ImportMatchesOutput> {
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
    .substring(0, 40000); // Limite di sicurezza per il contesto
};

const importMatchesFlow = ai.defineFlow(
  {
    name: 'importMatchesFlow',
    inputSchema: ImportMatchesInputSchema,
    outputSchema: ImportMatchesOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Configurazione Mancante: La chiave API non è stata configurata sul server.');

    if (!input.rawContent || input.rawContent.trim().length < 50) {
      throw new Error('Il contenuto incollato sembra troppo breve o vuoto.');
    }

    const contentToAnalyze = cleanContent(input.rawContent);

    try {
      const { output } = await prompt({ content: contentToAnalyze });
      if (!output || !output.matches || output.matches.length === 0) {
        throw new Error('L\'AI non è riuscita a trovare partite nel testo fornito. Assicurati di aver copiato la tabella del calendario.');
      }
      return output;
    } catch (error: any) {
      console.error("AI Analysis error:", error);
      throw new Error(error.message || 'Errore durante l\'analisi del testo tramite AI.');
    }
  }
);
