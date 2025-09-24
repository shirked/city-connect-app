
import { NextRequest, NextResponse } from 'next/server';
import { processWhatsappMessage } from '@/ai/flows/whatsapp-flow';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  // Reconstruct the full URL, including the protocol and host.
  // This is crucial for validation.
  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  // Use new URL() to handle potential double slashes and normalize the path.
  const fullUrl = new URL(req.nextUrl.pathname, `${protocol}://${host}`).toString();

  // Validate that the request is coming from Twilio
  const twilioSignature = req.headers.get('x-twilio-signature');
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';

  const paramObject: { [key: string]: string } = {};
  for (const [key, value] of params.entries()) {
      paramObject[key] = value;
  }
  
  if (!twilioSignature || !twilio.validateRequest(authToken, twilioSignature, fullUrl, paramObject)) {
    // Log the validation failure for easier debugging in Vercel logs
    console.error('Twilio webhook validation failed.', {
      url: fullUrl,
      twilioSignature,
      params: paramObject,
    });
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const from = paramObject.From;
  const messageBody = paramObject.Body;
  const mediaUrl = paramObject.NumMedia !== '0' ? paramObject.MediaUrl0 : undefined;
  const latitude = paramObject.Latitude;
  const longitude = paramObject.Longitude;
  
  try {
    // Asynchronously process the message without blocking the response to Twilio
    // IMPORTANT: We do not await this promise. We want it to run in the background.
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
    // The main logic in whatsapp-flow.ts will send the actual reply.
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('Error in Twilio webhook:', error);
    return new NextResponse('Internal ServerError', { status: 500 });
  }
}
