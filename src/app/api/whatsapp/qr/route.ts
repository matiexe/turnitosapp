import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEvolutionQRCode, getEvolutionConnectionState, createEvolutionInstance } from '@/lib/whatsappService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'ID de comercio (tenantId) requerido.' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Comercio no encontrado.' }, { status: 404 });
    }

    const instanceName = tenant.whatsappInstanceId || `inst_${tenant.slug}`;

    // 1. Fetch connection state from Evolution API
    let stateData = await getEvolutionConnectionState(instanceName);

    // If instance doesn't exist yet, attempt creation
    if (stateData?.error || stateData?.statusCode === 404) {
      await createEvolutionInstance(instanceName);
      stateData = await getEvolutionConnectionState(instanceName);
    }

    const instanceState = stateData?.instance?.state || stateData?.state || 'disconnected';

    let currentStatus: 'connected' | 'disconnected' | 'qrcode_ready' = 'disconnected';
    let qrCodeBase64: string | null = null;

    if (instanceState === 'open' || instanceState === 'connected') {
      currentStatus = 'connected';
    } else {
      // 2. Fetch QR Code
      const qrData = await getEvolutionQRCode(instanceName);
      if (qrData?.base64) {
        qrCodeBase64 = qrData.base64;
        currentStatus = 'qrcode_ready';
      } else if (qrData?.code) {
        qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData.code)}`;
        currentStatus = 'qrcode_ready';
      } else {
        // Fallback demo QR code
        qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAAS_TENANT_QR_${tenant.slug}`;
        currentStatus = 'qrcode_ready';
      }
    }

    // 3. Sync status to database
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        whatsappStatus: currentStatus,
        whatsappInstanceId: instanceName
      }
    });

    return NextResponse.json({
      success: true,
      instanceName,
      status: currentStatus,
      qrCodeUrl: qrCodeBase64
    });

  } catch (error: any) {
    console.error('Error in WhatsApp QR endpoint:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
