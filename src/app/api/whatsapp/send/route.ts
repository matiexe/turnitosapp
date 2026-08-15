import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEvolutionTextMessage } from '@/lib/whatsappService';

export async function POST(req: Request) {
  try {
    const { tenantId, phone, message } = await req.json();

    if (!tenantId || !phone || !message) {
      return NextResponse.json({ success: false, error: 'Campos tenantId, phone y message requeridos.' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Comercio no encontrado.' }, { status: 404 });
    }

    const instanceName = tenant.whatsappInstanceId || `inst_${tenant.slug}`;

    const sendResult = await sendEvolutionTextMessage(instanceName, phone, message);

    if (!sendResult.success) {
      return NextResponse.json({
        success: false,
        error: sendResult.error || 'No se pudo enviar el mensaje por WhatsApp.',
        details: sendResult
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result: sendResult,
      messageSent: true
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
