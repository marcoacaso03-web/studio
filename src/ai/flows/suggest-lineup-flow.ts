'use server';
/**
 * @fileOverview Flusso AI per suggerire la formazione associando nomi testuali agli ID del database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PlayerSimpleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const SuggestLineupInputSchema = z.object({
  rawList: z.string().describe('La lista dei nomi dei giocatori scritta o incollata dall\'utente.'),
  availablePlayers: z.array(PlayerSimpleSchema).describe('L\'elenco dei giocatori registrati nel database con i loro ID.'),
});
export type SuggestLineupInput = z.infer<typeof SuggestLineupInputSchema>;

const SuggestLineupOutputSchema = z.object({
  starters: z.array(z.string()).describe('Array di 11 ID per i titolari. Usa stringa vuota se il giocatore non è trovato.'),
  substitutes: z.array(z.string()).describe('Array di ID per le riserve. Massimo 9. Usa stringa vuota se non trovato.'),
});
export type SuggestLineupOutput = z.infer<typeof SuggestLineupOutputSchema>;

const prompt = ai.definePrompt({
  name: 'suggestLineupPrompt',
  input: { schema: SuggestLineupInputSchema },
  output: { schema: SuggestLineupOutputSchema },
  prompt: `Sei un assistente tecnico per un allenatore di calcio. 
Ti è stata fornita una lista testuale di nomi (spesso scritta in modo informale) che rappresenta la formazione per una partita.
Il tuo compito è mappare questi nomi agli ID dei giocatori reali presenti nel database fornito.

REGOLE:
1. Analizza la lista e identifica i primi 11 giocatori come titolari.
2. Identifica i restanti come riserve (massimo 9).
3. Per ogni nome trovato nella lista, cerca la corrispondenza più probabile nell'elenco 'availablePlayers'.
4. Se un nome nella lista non ha una corrispondenza chiara nel database, lascia quel posto come stringa vuota ("").
5. Restituisci esattamente 11 elementi per 'starters' e fino a 9 per 'substitutes'.

GIOCATORI NEL DATABASE:
{{#each availablePlayers}}
- ID: {{id}}, Nome: {{name}}
{{/each}}

LISTA DELL'UTENTE:
{{{rawList}}}`,
});

export async function suggestLineup(input: SuggestLineupInput): Promise<SuggestLineupOutput> {
  return suggestLineupFlow(input);
}

const suggestLineupFlow = ai.defineFlow(
  {
    name: 'suggestLineupFlow',
    inputSchema: SuggestLineupInputSchema,
    outputSchema: SuggestLineupOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('L\'AI non ha restituito una risposta valida.');
      }
      return output;
    } catch (error: any) {
      console.error("AI Lineup Error:", error);
      throw new Error(error.message || 'Errore durante l\'associazione dei giocatori tramite AI.');
    }
  }
);
