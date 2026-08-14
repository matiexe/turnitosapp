import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEvolutionTextMessage } from '@/lib/whatsappService';

export async function GET() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch active appointments for today & tomorrow
    const appointments = await prisma.appointment.findMany({
      where: {
        date: { in: [todayStr, tomorrowStr] },
        status: { in: ['confirmed', 'pending'] }
      },
      include: {
        tenant: true,
        service: true,
        professional: true
      }
    });

    let remindersSent = 0;

    for (const app of appointments) {
      const { tenant, service, professional, clientName, clientPhone, date, time } = app;
      if (!tenant || !clientPhone) continue;

      const instanceName = tenant.whatsappInstanceId || `inst_${tenant.slug}`;

      // 24h Reminder for tomorrow's appointments
      if (date === tomorrowStr && tenant.whatsappAutoRemind24h) {
        const text = `¡Hola ${clientName}! 👋 Te recordamos tu turno para mañana *${date}* a las *${time} hs* en *${tenant.name}*.\n\n` +
          `✂️ *Servicio:* ${service?.name || 'Consulta'}\n` +
          `👤 *Profesional:* ${professional?.name || 'Asignado'}\n\n` +
          `¿Nos confirmás tu asistencia? ¡Te esperamos!`;

        await sendEvolutionTextMessage(instanceName, clientPhone, text);
        remindersSent++;
      }

      // 2h Reminder for today's appointments
      if (date === todayStr && tenant.whatsappAutoRemind2h) {
        const text = `¡Hola ${clientName}! ⏰ Recordatorio exprés: Tu turno en *${tenant.name}* es hoy a las *${time} hs*.\n\n` +
          `📍 Por favor recordá ser puntual. ¡Nos vemos pronto!`;

        await sendEvolutionTextMessage(instanceName, clientPhone, text);
        remindersSent++;
      }
    }

    return NextResponse.json({
      success: true,
      scannedAppointments: appointments.length,
      remindersSent,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error running cron reminders API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
