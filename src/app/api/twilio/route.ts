
import { NextRequest, NextResponse } from 'next/server';
import { processWhatsappMessage } from '@/ai/flows/whatsapp-flow';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  // Validate that the request is coming from Twilio
  const twilioSignature = req.headers.get('x-twilio-signature');
  const url = `${process.env.SITE_URL}${req.nextUrl.pathname}`;
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';

  const paramObject: { [key: string]: string } = {};
  for (const [key, value] of params.entries()) {
      paramObject[key] = value;
  }
  
  if (!twilioSignature || !twilio.validateRequest(authToken, twilioSignature, url, paramObject)) {
    // Log the validation failure for easier debugging in Vercel logs
    console.error('Twilio webhook validation failed.', {
      url,
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
