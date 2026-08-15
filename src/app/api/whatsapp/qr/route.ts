import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEvolutionQRCode, getEvolutionConnectionState, createEvolutionInstance, getEvolutionConfig } from '@/lib/whatsappService';

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

    const config = getEvolutionConfig();

    // Check if EVOLUTION_API_URL is properly configured
    if (!config.baseUrl || config.baseUrl.includes('tuturnito.app')) {
      return NextResponse.json({
        success: false,
        isConfigured: false,
        error: 'Servidor de WhatsApp (EVOLUTION_API_URL) no configurado en las variables de entorno de Vercel.',
        status: 'disconnected'
      }, { status: 400 });
    }

    const instanceName = tenant.whatsappInstanceId || `inst_${tenant.slug}`;

    // 1. Check current connection state
    let stateData = await getEvolutionConnectionState(instanceName);

    // If instance doesn't exist yet, attempt creation
    if (stateData?.error || stateData?.statusCode === 404 || stateData?.message?.includes('not found')) {
      await createEvolutionInstance(instanceName);
      stateData = await getEvolutionConnectionState(instanceName);
    }

    const instanceState = stateData?.instance?.state || stateData?.state || stateData?.connectionStatus || 'disconnected';

    let currentStatus: 'connected' | 'disconnected' | 'qrcode_ready' = 'disconnected';
    let qrCodeBase64: string | null = null;

    if (instanceState === 'open' || instanceState === 'connected') {
      currentStatus = 'connected';
    } else {
      // 2. Fetch QR Code from Evolution API v2
      const qrData = await getEvolutionQRCode(instanceName);

      const rawBase64 = qrData?.base64 || qrData?.qrcode?.base64;
      const rawCode = qrData?.code || qrData?.qrcode?.code;

      if (rawBase64) {
        qrCodeBase64 = rawBase64.startsWith('data:image') ? rawBase64 : `data:image/png;base64,${rawBase64}`;
        currentStatus = 'qrcode_ready';
      } else if (rawCode) {
        qrCodeBase64 = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(rawCode)}`;
        currentStatus = 'qrcode_ready';
      } else if (qrData?.instance?.state === 'open' || qrData?.state === 'open') {
        currentStatus = 'connected';
      } else {
        currentStatus = 'disconnected';
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
      qrCodeUrl: qrCodeBase64,
      rawState: instanceState,
      apiUrlUsed: config.baseUrl
    });

  } catch (error: any) {
    console.error('Error in WhatsApp QR endpoint:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
