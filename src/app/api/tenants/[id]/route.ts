import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: {
        users: true,
        services: true,
        professionals: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Negocio no encontrado.' }, { status: 404 });
    }

    const formatted = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      rubro: tenant.rubro,
      ownerName: tenant.ownerName,
      ownerEmail: tenant.ownerEmail,
      phone: tenant.phone,
      plan: tenant.plan,
      status: tenant.status,
      createdAt: tenant.createdAt.toISOString().split('T')[0],
      slotIntervalMinutes: tenant.slotIntervalMinutes,
      hasCompletedOnboarding: tenant.hasCompletedOnboarding,
      branding: {
        logoUrl: tenant.logoUrl || undefined,
        bannerUrl: tenant.bannerUrl || undefined,
        primaryColor: tenant.primaryColor || '#10b981',
      },
      whatsappConfig: {
        instanceId: tenant.whatsappInstanceId || `inst_${tenant.slug}`,
        phoneNumber: tenant.whatsappPhoneNumber || tenant.phone,
        status: tenant.whatsappStatus || 'connected',
        autoRemind24h: tenant.whatsappAutoRemind24h,
        autoRemind2h: tenant.whatsappAutoRemind2h,
        welcomeMessage: tenant.whatsappWelcomeMessage || `¡Hola! Bienvenido a ${tenant.name}.`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAAS_TENANT_QR_${tenant.slug}`
      }
    };

    return NextResponse.json({ success: true, tenant: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.ownerName !== undefined) updateData.ownerName = body.ownerName;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.bannerUrl !== undefined) updateData.bannerUrl = body.bannerUrl;
    if (body.primaryColor !== undefined) updateData.primaryColor = body.primaryColor;
    if (body.branding) {
      if (body.branding.logoUrl !== undefined) updateData.logoUrl = body.branding.logoUrl;
      if (body.branding.bannerUrl !== undefined) updateData.bannerUrl = body.branding.bannerUrl;
      if (body.branding.primaryColor !== undefined) updateData.primaryColor = body.branding.primaryColor;
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
