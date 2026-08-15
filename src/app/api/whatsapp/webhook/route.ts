import { NextResponse } from 'next/server';
import { handleIncomingWhatsappMessage } from '@/lib/whatsappBotSession';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check Evolution API Webhook Event
    const event = body?.event; // e.g. "messages.upsert"
    const instance = body?.instance; // e.g. "inst_barberia"

    if (event === 'messages.upsert' && body?.data) {
      const data = body.data;
      const key = data?.key;
      const fromMe = key?.fromMe;

      // Ignore messages sent by ourselves
      if (!fromMe && key?.remoteJid) {
        const remoteJid = key.remoteJid;
        // e.g. 5491112345678@s.whatsapp.net
        const clientPhone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
        const pushName = data?.pushName || 'Cliente';

        const messageText =
          data?.message?.conversation ||
          data?.message?.extendedTextMessage?.text ||
          data?.message?.buttonsResponseMessage?.selectedButtonId ||
          '';

        if (messageText && instance) {
          // Process conversation step asynchronously
          await handleIncomingWhatsappMessage(instance, clientPhone, pushName, messageText);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in WhatsApp webhook endpoint:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'active', bot: 'tuturnito-whatsapp-bot' });
}
