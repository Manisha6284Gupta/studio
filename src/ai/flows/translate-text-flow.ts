'use server';
/**
 * @fileOverview A Genkit flow for translating text into English.
 *
 * - translateTextToEnglish - A function that handles the translation.
 * - TranslateTextInput - The input type for the translation function.
 * - TranslateTextOutput - The return type for the translation function.
 */

import { ai } from '@/ai/genkit';
import { TranslateTextInput, TranslateTextInputSchema, TranslateTextOutput, TranslateTextOutputSchema } from '@/lib/ai-types';

export { TranslateTextInput, TranslateTextOutput };

export async function translateTextToEnglish(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateToEnglishPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `You are a translation expert. The user will provide text in some language.
Your task is to translate this text into English. If the text is already in English, simply return the original text.
Only return the translated English text.

Text to translate:
{{{text}}}
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const output = response.output;
    if (!output) {
      console.error("Translation flow failed to produce structured output. Raw text:", response.text);
      throw new Error("AI failed to generate a valid translation structure.");
    }
    return output;
  }
);
