import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDbSeeded } from '@/lib/seedDb';

export async function POST(req: Request) {
  try {
    await ensureDbSeeded();
    const { email } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'Por favor ingresá tu correo electrónico.' }, { status: 400 });
    }

    // 1. Search by Tenant Owner Email in Database
    let foundTenant = await prisma.tenant.findUnique({
      where: { ownerEmail: cleanEmail }
    });

    // 2. If not found, search by TenantUser (collaborator) in Database
    if (!foundTenant) {
      const matchedUser = await prisma.tenantUser.findUnique({
        where: { email: cleanEmail },
        include: { tenant: true }
      });
      if (matchedUser) {
        foundTenant = matchedUser.tenant;
      }
    }

    // 3. If account is not found in Database, return error (NEVER return demo!)
    if (!foundTenant) {
      return NextResponse.json({
        success: false,
        error: 'No encontramos ningún negocio o usuario registrado con este email. Verificá los datos o registrá tu comercio.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        email: cleanEmail,
        tenantId: foundTenant.id,
        role: 'tenant_admin'
      },
      tenant: {
        id: foundTenant.id,
        name: foundTenant.name,
        slug: foundTenant.slug
      }
    });
  } catch (error: any) {
    console.error('Error in Business Login API:', error);
    const isDbError = error?.message?.includes('Unable to open') || error?.message?.includes('prisma') || error?.code === 'P1012';
    const friendlyError = isDbError
      ? 'No se pudo conectar con la base de datos local. Por favor intentá nuevamente.'
      : (error.message || 'Error al procesar el inicio de sesión.');
    return NextResponse.json({ success: false, error: friendlyError }, { status: 500 });
  }
}
