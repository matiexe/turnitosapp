import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDbSeeded } from '@/lib/seedDb';

export async function GET() {
  try {
    await ensureDbSeeded();
    const tenants = await prisma.tenant.findMany({
      include: {
        users: true,
        services: true,
        professionals: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = tenants.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      rubro: t.rubro,
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail,
      phone: t.phone,
      plan: t.plan,
      status: t.status,
      createdAt: t.createdAt.toISOString().split('T')[0],
      slotIntervalMinutes: t.slotIntervalMinutes,
      hasCompletedOnboarding: t.hasCompletedOnboarding,
      branding: {
        logoUrl: t.logoUrl || undefined,
        bannerUrl: t.bannerUrl || undefined,
        primaryColor: t.primaryColor || '#10b981',
      },
      whatsappConfig: {
        instanceId: t.whatsappInstanceId || `inst_${t.slug}`,
        phoneNumber: t.whatsappPhoneNumber || t.phone,
        status: t.whatsappStatus || 'connected',
        autoRemind24h: t.whatsappAutoRemind24h,
        autoRemind2h: t.whatsappAutoRemind2h,
        welcomeMessage: t.whatsappWelcomeMessage || `¡Hola! Bienvenido a ${t.name}.`,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAAS_TENANT_QR_${t.slug}`
      }
    }));

    return NextResponse.json({ success: true, tenants: formatted });
  } catch (error: any) {
    console.error('Error fetching tenants API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, rubro, ownerName, ownerEmail, phone } = body;

    if (!name || !ownerEmail) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const cleanEmail = ownerEmail.toLowerCase().trim();
    let tenantSlug = (slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')).replace(/(^-|-$)+/g, '');
    if (!tenantSlug) tenantSlug = `negocio-${Date.now()}`;

    // Check for existing business with same email or slug
    const existing = await prisma.tenant.findFirst({
      where: {
        OR: [
          { ownerEmail: cleanEmail },
          { slug: tenantSlug }
        ]
      }
    });

    if (existing) {
      if (existing.ownerEmail === cleanEmail) {
        return NextResponse.json({
          success: false,
          error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor iniciá sesión en /login.'
        }, { status: 400 });
      } else {
        tenantSlug = `${tenantSlug}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    const newTenant = await prisma.tenant.create({
      data: {
        name,
        slug: tenantSlug,
        rubro: rubro || 'peluqueria',
        ownerName: ownerName || 'Propietario',
        ownerEmail: cleanEmail,
        phone: phone || '+54 9 11 0000-0000',
        plan: 'trial',
        status: 'active',
        slotIntervalMinutes: 30,
        hasCompletedOnboarding: false,
        whatsappInstanceId: `inst_${tenantSlug}`,
        whatsappPhoneNumber: phone,
        whatsappStatus: 'qrcode_ready',
        whatsappWelcomeMessage: `¡Hola! Bienvenido a ${name}. ¿Qué turno querés agendar hoy?`
      }
    });

    return NextResponse.json({ success: true, tenant: newTenant });
  } catch (error: any) {
    console.error('Error creating tenant API:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Ya existe un negocio registrado con ese correo o slug. Por favor probá con otro email o iniciá sesión.'
      }, { status: 400 });
    }

    if (error?.message?.includes('readonly') || error?.message?.includes('Unable to open')) {
      return NextResponse.json({
        success: false,
        error: 'El sistema está en modo lectura o la base de datos de producción necesita la variable DATABASE_URL de PostgreSQL/Supabase.'
      }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: error.message || 'Error al registrar la empresa.' }, { status: 500 });
  }
}
