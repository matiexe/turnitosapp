import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDbSeeded } from '@/lib/seedDb';

export async function GET() {
  const rawUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    '';

  // Mask database URL for security (hide password)
  const maskedUrl = rawUrl
    ? rawUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:******@')
    : 'NO DEFINIDA';

  const isPostgres = rawUrl.includes('postgres');

  try {
    // Attempt database query
    await ensureDbSeeded();
    const tenantCount = await prisma.tenant.count();
    const appointmentCount = await prisma.appointment.count();

    return NextResponse.json({
      success: true,
      status: 'HEALTHY 🟢',
      message: '¡Conexión exitosa con la base de datos!',
      databaseEngine: isPostgres ? 'PostgreSQL / Neon Cloud' : 'SQLite / Local',
      envVariableFound: Boolean(rawUrl),
      connectionUrlMasked: maskedUrl,
      metrics: {
        totalTenants: tenantCount,
        totalAppointments: appointmentCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Database Health Check Failed:', error);

    return NextResponse.json({
      success: false,
      status: 'UNHEALTHY 🔴',
      message: 'No se pudo conectar a la base de datos de Neon/PostgreSQL.',
      databaseEngine: isPostgres ? 'PostgreSQL / Neon Cloud' : 'SQLite / Local',
      envVariableFound: Boolean(rawUrl),
      connectionUrlMasked: maskedUrl,
      errorDetails: error.message || String(error),
      errorCode: error.code || 'UNKNOWN_ERROR',
      troubleshootingTip: !rawUrl
        ? 'La variable DATABASE_URL no se encuentra definida en el proyecto de Vercel.'
        : 'Verificá que las tablas hayan sido sincronizadas con "npx prisma db push" en Neon.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
