import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDbSeeded } from '@/lib/seedDb';

export async function GET(req: Request) {
  try {
    await ensureDbSeeded();
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    const date = searchParams.get('date');

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (date) where.date = date;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { time: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    console.error('Error fetching appointments API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, professionalId, serviceId, clientName, clientPhone, date, time, notes } = body;

    if (!tenantId || !clientName || !clientPhone || !date || !time) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios para agendar el turno.' }, { status: 400 });
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        tenantId,
        professionalId: professionalId || '',
        serviceId: serviceId || '',
        clientName,
        clientPhone,
        date,
        time,
        status: 'pending',
        depositPaid: false,
        notes
      }
    });

    // Also update or create Client entry in DB
    const existingClient = await prisma.client.findFirst({
      where: { tenantId, phone: clientPhone }
    });

    if (existingClient) {
      await prisma.client.update({
        where: { id: existingClient.id },
        data: { totalAppointments: existingClient.totalAppointments + 1 }
      });
    } else {
      await prisma.client.create({
        data: {
          tenantId,
          name: clientName,
          phone: clientPhone,
          totalAppointments: 1
        }
      });
    }

    return NextResponse.json({ success: true, appointment: newAppointment });
  } catch (error: any) {
    console.error('Error creating appointment API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status, depositPaid } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID de turno requerido.' }, { status: 400 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (depositPaid !== undefined) updateData.depositPaid = depositPaid;

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
