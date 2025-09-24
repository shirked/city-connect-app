
'use server';
/**
 * @fileOverview A conversational AI flow for the community chatbot.
 *
 * - chat - A function that handles the conversation with the AI.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest user message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async ({ history, message }) => {
    // Gemini API expects a specific format. We need to convert our history.
    const messages = history.map(h => ({
      role: h.role,
      content: [{ text: h.content }],
    }));

    const result = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-latest'),
      prompt: message,
      history: messages,
      system: `You are a helpful assistant for Civic Connect, a civic issue reporting app. Answer user questions about the app, civic issues, and the community. Always respond in the same language as the user's message.`,
    });

    const text = result.text;

    return { response: text };
  }
);
