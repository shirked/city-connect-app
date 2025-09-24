
'use server';
/**
 * @fileOverview Processes incoming WhatsApp messages from Twilio using a stateful conversation model.
 *
 * - processWhatsappMessage - A function that handles the message processing.
 * - WhatsappMessageInput - The input type for the process/WhatsappMessage function.
 */

import { z } from 'genkit';
import { addReportFromWhatsapp } from '@/lib/whatsapp-actions';
import twilio from 'twilio';
import {
  getConversationState,
  updateConversationState,
  deleteConversationState,
  ConversationState,
} from '@/lib/whatsapp-conversation-service';

const WhatsappMessageInputSchema = z.object({
  from: z.string().describe('The phone number the message is from.'),
  body: z.string().describe('The text content of the message.'),
  mediaUrl: z.string().optional().describe('A URL to an image attached to the message.'),
  latitude: z.string().optional().describe('The latitude of the user\'s location.'),
  longitude: z.string().optional().describe('The longitude of the user\'s location.'),
});
export type WhatsappMessageInput = z.infer<typeof WhatsappMessageInputSchema>;

export async function processWhatsappMessage(input: WhatsappMessageInput) {
  return await whatsappFlow(input);
}

const whatsappFlow = ai.defineFlow(
  {
    name: 'whatsappFlow',
    inputSchema: WhatsappMessageInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    console.log(`[whatsappFlow] Started for ${input.from}. State machine initiated.`);
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const sendReply = async (message: string) => {
      try {
        console.log(`[whatsappFlow] Replying to ${input.from}: "${message}"`);
        await twilioClient.messages.create({
          body: message,
          from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
          to: input.from,
        });
      } catch (error) {
        console.error(`[whatsappFlow] CRITICAL: Failed to send Twilio message to ${input.from}. Error:`, error);
      }
    };

    const currentState = await getConversationState(input.from);
    const userMessage = input.body.toLowerCase().trim();

    // Handle reset/cancel commands at any stage
    if (['reset', 'cancel', 'stop'].includes(userMessage)) {
      await deleteConversationState(input.from);
      await sendReply("Your session has been reset. Send 'Hi' or 'Report' to start a new report.");
      return;
    }

    switch (currentState.step) {
      case 'AWAITING_PHOTO':
        if (!input.mediaUrl) {
          await sendReply("I see you sent a message, but I need a photo of the issue to proceed. Please send a picture.");
          return;
        }
        currentState.photoUrl = input.mediaUrl;
        currentState.step = 'AWAITING_DESCRIPTION';
        await updateConversationState(input.from, currentState);
        await sendReply("Great, I've got the photo! Now, please describe the issue for me.");
        break;

      case 'AWAITING_DESCRIPTION':
        if (!input.body) {
          await sendReply("I need a text description of the issue. Could you please explain what's wrong?");
          return;
        }
        currentState.description = input.body;
        currentState.step = 'AWAITING_LOCATION';
        await updateConversationState(input.from, currentState);
        await sendReply("Thanks for the description. Lastly, please share your location using the WhatsApp location feature. This helps us pinpoint the exact spot.");
        break;

      case 'AWAITING_LOCATION':
         if (!input.latitude || !input.longitude) {
            await sendReply("I'm still waiting for the location. Please use the 'Attach' (paperclip icon) -> 'Location' feature in WhatsApp to send it.");
            return;
        }
        currentState.location = { lat: parseFloat(input.latitude), lng: parseFloat(input.longitude) };
        currentState.step = 'COMPLETED';
        await updateConversationState(input.from, currentState);

        // All information gathered, now create the report
        await sendReply("Thank you! I have all the information. I'm submitting your report now. I'll send a confirmation in just a moment.");

        try {
          const newReportId = await addReportFromWhatsapp({
            description: currentState.description!,
            photoUrl: currentState.photoUrl!,
            location: currentState.location,
            reporterPhone: input.from,
          });
          await sendReply(`Success! Your report has been submitted with ID: ${newReportId}. Thank you for helping improve your community.`);
          // Clean up the conversation state
          await deleteConversationState(input.from);
        } catch (error) {
          console.error('[whatsappFlow] CRITICAL: Failed to create report from stateful conversation:', error);
          await sendReply('Sorry, there was an error submitting your final report. Please try starting a new report later.');
        }
        break;

      default: // This also covers the 'START' case
        // Check for greeting to start the flow
        if (['hi', 'hello', 'report', 'start'].includes(userMessage)) {
            const newState: ConversationState = { step: 'AWAITING_PHOTO' };
            await updateConversationState(input.from, newState);
            await sendReply("Hello! I can help you report a civic issue. Please start by sending a photo of the problem.");
        } else {
            await sendReply("Welcome to Civic Connect! Send 'Hi' or 'Report' to begin creating a new civic issue report.");
        }
        break;
    }
  }
);

// We remove the old AI-based prompt and schema as they are no longer needed
// for the main conversation flow.
import { ai } from '@/ai/genkit';
