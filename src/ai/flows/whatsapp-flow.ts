
'use server';
/**
 * @fileOverview Processes incoming WhatsApp messages from Twilio to create a civic report.
 *
 * - processWhatsappMessage - A function that handles the message processing.
 * - WhatsappMessageInput - The input type for the processWhatsappMessage function.
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
    hasSufficientInfo: z.boolean().describe("Set to true if you have enough information (a description and a photo) to create a report. Otherwise, set to false."),
    clarificationQuestion: z.string().optional().describe("If hasSufficientInfo is false, ask a question to get the necessary information (e.g., 'Please send a photo of the issue.' or 'Could you describe the problem?')."),
});

export async function processWhatsappMessage(input: WhatsappMessageInput) {
  return await whatsappFlow(input);
}

const suggestionPrompt = ai.definePrompt({
    name: 'whatsappSuggestionPrompt',
    input: { schema: z.object({ body: z.string() }) },
    output: { schema: ReportSuggestionSchema },
    model: googleAI.model('gemini-1.5-pro-latest'),
    prompt: `You are an AI assistant for a civic reporting hotline. Your goal is to create a valid report from an incoming WhatsApp message. A valid report needs a description and a photo.
    
    Analyze the user's message: \`{{{body}}}\`.
    
    - Extract the description of the problem.
    - Determine if enough information is available to create a report.
    - If the user's message is conversational (e.g., "hello", "can you help?"), ask them to describe the issue and send a photo.
    - If a photo is missing, ask for a photo.
    - If a description is missing, ask for one.
    
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

    if (!input.mediaUrl) {
      await sendReply("Thanks for your message! To create a report, please send a photo of the issue you're seeing.");
      return;
    }
    
    if (!input.body) {
      await sendReply("Thanks for the photo! Please also provide a short description of the problem.");
      return;
    }

    // Use AI to process the text for a better description
    const { output } = await suggestionPrompt({ body: input.body });
    const suggestion = output!;

    if (!suggestion.hasSufficientInfo) {
        await sendReply(suggestion.clarificationQuestion || "Could you please provide more details and a photo so I can submit the report?");
        return;
    }

    try {
      const newReportId = await addReportFromWhatsapp({
        description: suggestion.description,
        photoUrl: input.mediaUrl,
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
