
import { NextRequest, NextResponse } from 'next/server';
import { processWhatsappMessage } from '@/ai/flows/whatsapp-flow';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const body = await req.formData();

  // Validate that the request is coming from Twilio
  const twilioSignature = req.headers.get('x-twilio-signature');
  // Use a server-side environment variable for the site URL for security and flexibility.
  const url = `${process.env.SITE_URL}/api/twilio`;
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';

  const params: { [key: string]: string } = {};
  for (const [key, value] of body.entries()) {
      if (typeof value === 'string') {
          params[key] = value;
      }
  }

  if (!twilioSignature || !twilio.validateRequest(authToken, twilioSignature, url, params)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const from = params.From;
  const messageBody = params.Body;
  const mediaUrl = params.NumMedia !== '0' ? params.MediaUrl0 : undefined;
  const latitude = params.Latitude;
  const longitude = params.Longitude;
  
  try {
    // Asynchronously process the message without blocking the response to Twilio
    processWhatsappMessage({
        from,
        body: messageBody,
        mediaUrl: mediaUrl,
        latitude: latitude,
        longitude: longitude,
    }).catch(err => {
        // Log errors that happen in the background flow
        console.error("Error processing WhatsApp message in background:", err);
    });

    // Respond to Twilio immediately to acknowledge receipt of the message
    const twiml = new twilio.twiml.MessagingResponse();
    // Optionally send a quick "we're processing your message" response here, 
    // but the main logic will send a more detailed reply.
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('Error in Twilio webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
