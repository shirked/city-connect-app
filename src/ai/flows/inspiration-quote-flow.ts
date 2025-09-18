
'use server';
/**
 * @fileOverview Generates an inspirational environmental quote.
 *
 * - generateInspirationQuote - A function that generates a quote based on issue descriptions.
 * - InspirationQuoteInput - The input type for the generateInspirationQuote function.
 * - InspirationQuoteOutput - The return type for the generateInspirationQuote function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const InspirationQuoteInputSchema = z.object({
  reportDescriptions: z
    .array(z.string())
    .describe('A list of descriptions of reported civic issues.'),
});
export type InspirationQuoteInput = z.infer<
  typeof InspirationQuoteInputSchema
>;

const InspirationQuoteOutputSchema = z.object({
  quote: z
    .string()
    .describe('An inspirational environmental quote related to the issues.'),
});
export type InspirationQuoteOutput = z.infer<
  typeof InspirationQuoteOutputSchema
>;

export async function generateInspirationQuote(
  input: InspirationQuoteInput
): Promise<InspirationQuoteOutput> {
  return inspirationQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inspirationQuotePrompt',
  input: { schema: InspirationQuoteInputSchema },
  output: { schema: InspirationQuoteOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an environmental advocate and motivational speaker.
Based on the following list of recently reported civic issues, generate a short, powerful, and inspiring environmental quote (1-2 sentences).
The quote should motivate citizens to take action and improve their community's environment. Do not refer to the issues directly; use them for thematic inspiration.

Reported Issues:
{{#each reportDescriptions}}
- {{{this}}}
{{/each}}
`,
});

const inspirationQuoteFlow = ai.defineFlow(
  {
    name: 'inspirationQuoteFlow',
    inputSchema: InspirationQuoteInputSchema,
    outputSchema: InspirationQuoteOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
