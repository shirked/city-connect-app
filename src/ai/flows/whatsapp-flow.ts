
'use server';
/**
 * @fileOverview Processes incoming WhatsApp messages from Twilio to create a civic report.
 *
 * - processWhatsappMessage - A function that handles the message processing.
 * - WhatsappMessageInput - The input type for the process/WhatsappMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addReportFromWhatsapp } from '@/lib/whatsapp-actions';
import { googleAI } from '@genkit-ai/googleai';
import twilio from 'twilio';

const WhatsappMessageInputSchema = z.object({
  from: z.string().describe('The phone number the message is from.'),
  body: z.string().describe('The text content of the message.'),
  mediaUrl: z.string().optional().describe('A URL to an image attached to the message.'),
  latitude: z.string().optional().describe('The latitude of the user\'s location.'),
  longitude: z.string().optional().describe('The longitude of the user\'s location.'),
});
export type WhatsappMessageInput = z.infer<typeof WhatsappMessageInputSchema>;

const ReportSuggestionSchema = z.object({
    description: z.string().describe("A concise and clear description of the issue based on the user's message. If the message is unclear, ask for more details."),
    hasSufficientInfo: z.boolean().describe("Set to true if you have enough information (a description AND a photo) to create a report. Otherwise, set to false."),
    clarificationQuestion: z.string().optional().describe("If hasSufficientInfo is false, ask a question to get the necessary information (e.g., 'Please send a photo of the issue.' or 'Could you describe the problem?')."),
});

export async function processWhatsappMessage(input: WhatsappMessageInput) {
  return await whatsappFlow(input);
}

const suggestionPrompt = ai.definePrompt({
    name: 'whatsappSuggestionPrompt',
    input: { schema: z.object({ body: z.string(), hasMedia: z.boolean() }) },
    output: { schema: ReportSuggestionSchema },
    model: googleAI.model('gemini-1.5-pro-latest'),
    prompt: `You are an AI assistant for a civic reporting hotline. Your goal is to create a valid report from an incoming WhatsApp message. A valid report needs a description and a photo.
    
    Analyze the user's message and current context.
    - User's message: \`{{{body}}}\`
    - Does the message include a photo? \`{{{hasMedia}}}\`
    
    - If the user's message is just a greeting or conversational (e.g., "hello", "can you help?"), ask them to describe the issue and send a photo.
    - If a photo is missing, ask for a photo.
    - If a description is missing, ask for one.
    - If both a photo and a clear description are present, extract the description and determine that you have sufficient info.
    
    Respond with the extracted information in the requested JSON format.
    `,
});

const whatsappFlow = ai.defineFlow(
  {
    name: 'whatsappFlow',
    inputSchema: WhatsappMessageInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const sendReply = async (message: string) => {
      await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: input.from,
      });
    };
    
    const { output } = await suggestionPrompt({ body: input.body, hasMedia: !!input.mediaUrl });
    const suggestion = output!;

    if (!suggestion.hasSufficientInfo || !input.mediaUrl) {
        await sendReply(suggestion.clarificationQuestion || "Could you please provide more details and a photo so I can submit the report?");
        return;
    }

    try {
      const newReportId = await addReportFromWhatsapp({
        description: suggestion.description,
        // The check above ensures mediaUrl is present.
        photoUrl: input.mediaUrl!, 
        location: (input.latitude && input.longitude) ? { lat: parseFloat(input.latitude), lng: parseFloat(input.longitude) } : undefined,
        reporterPhone: input.from,
      });
      await sendReply(`Thank you! Your report has been submitted successfully. You can track its progress with report ID: ${newReportId}`);
    } catch (error) {
      console.error('Failed to create report from WhatsApp message:', error);
      await sendReply('Sorry, there was an error submitting your report. Please try again later.');
    }
  }
);
