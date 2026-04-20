import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey
    })
  ]
});

async function test() {
    try {
        console.log('Testing Genkit Generate...');
        const result = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: 'Hello, what is your name?'
        });
        console.log('RESULT:', result.text);
    } catch (e: any) {
        console.error('GENKIT ERROR:', e.message);
    }
}

test();
