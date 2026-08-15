import { prisma } from '@/lib/prisma';
import { sendEvolutionTextMessage } from '@/lib/whatsappService';

export interface BotSessionState {
  step: 'MENU' | 'SELECT_SERVICE' | 'SELECT_PROFESSIONAL' | 'SELECT_DATE' | 'SELECT_TIME';
  tenantId: string;
  selectedServiceId?: string;
  selectedServiceName?: string;
  selectedServicePrice?: number;
  selectedProfessionalId?: string;
  selectedProfessionalName?: string;
  selectedDate?: string;
  selectedTime?: string;
  updatedAt: number;
}

// In-memory session store for active WhatsApp conversations
const botSessionsMap = new Map<string, BotSessionState>();

function getSession(clientPhone: string): BotSessionState | undefined {
  const session = botSessionsMap.get(clientPhone);
  // Sessions expire after 20 minutes of inactivity
  if (session && Date.now() - session.updatedAt > 20 * 60 * 1000) {
    botSessionsMap.delete(clientPhone);
    return undefined;
  }
  return session;
}

function saveSession(clientPhone: string, session: BotSessionState) {
  session.updatedAt = Date.now();
  botSessionsMap.set(clientPhone, session);
}

function clearSession(clientPhone: string) {
  botSessionsMap.delete(clientPhone);
}

export async function handleIncomingWhatsappMessage(
  instanceName: string,
  clientPhone: string,
  clientName: string,
  messageText: string
) {
  try {
    const cleanText = messageText.trim().toLowerCase();

    // Find tenant by instanceId or slug
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { whatsappInstanceId: instanceName },
          { slug: instanceName.replace(/^inst_/, '') }
        ]
      },
      include: {
        services: true,
        professionals: true
      }
    });

    if (!tenant) return;

    let session = getSession(clientPhone);

    // Cancel or reset command
    if (cleanText === '0' || cleanText === 'cancelar' || cleanText === 'salir' || cleanText === 'inicio') {
      clearSession(clientPhone);
      await sendEvolutionTextMessage(
        instanceName,
        clientPhone,
        `❌ Conversación reiniciada.\n\nEscribí *Hola* en cualquier momento para volver al menú principal.`
      );
      return;
    }

    // Step 1: Menu or initial greeting
    if (!session || session.step === 'MENU' || ['hola', 'buenas', 'turno', 'reservar', 'menu', 'precios'].includes(cleanText)) {
      session = {
        step: 'MENU',
        tenantId: tenant.id,
        updatedAt: Date.now()
      };

      if (cleanText === '1' || cleanText === 'reservar' || cleanText === 'turno') {
        // Jump directly to service selection
        await promptServiceSelection(instanceName, clientPhone, tenant, session);
        return;
      }

      if (cleanText === '2' || cleanText === 'servicios' || cleanText === 'precios') {
        let text = `📋 *Servicios & Precios en ${tenant.name}:*\n\n`;
        tenant.services.forEach((s, idx) => {
          text += `${idx + 1}. *${s.name}* — $${s.price.toLocaleString('es-AR')} (⏱️ ${s.durationMinutes} min)\n`;
        });
        text += `\nPara reservar un turno, respondé con *1*. 🗓️`;
        await sendEvolutionTextMessage(instanceName, clientPhone, text);
        saveSession(clientPhone, session);
        return;
      }

      if (cleanText === '3' || cleanText === 'mis turnos') {
        const activeAppts = await prisma.appointment.findMany({
          where: {
            tenantId: tenant.id,
            clientPhone: { contains: clientPhone.replace(/[^0-9]/g, '').slice(-8) },
            status: { in: ['pending', 'confirmed'] }
          },
          include: { service: true, professional: true }
        });

        if (activeAppts.length === 0) {
          await sendEvolutionTextMessage(
            instanceName,
            clientPhone,
            `🔎 No encontramos turnos pendientes asociados a tu número.\n\nRespondé *1* para reservar tu primer turno.`
          );
        } else {
          let text = `📅 *Tus Turnos Reservados en ${tenant.name}:*\n\n`;
          activeAppts.forEach((a, i) => {
            text += `${i + 1}. *${a.service?.name}* con *${a.professional?.name}*\n   🗓️ Fecha: ${a.date} a las ${a.time} hs\n\n`;
          });
          await sendEvolutionTextMessage(instanceName, clientPhone, text);
        }
        return;
      }

      if (cleanText === '4' || cleanText === 'web') {
        const webUrl = `https://tuturnito.app/reserva/${tenant.slug}`;
        await sendEvolutionTextMessage(
          instanceName,
          clientPhone,
          `🌐 Podés reservar desde tu navegador usando nuestro portal web oficial:\n👉 ${webUrl}`
        );
        return;
      }

      // Default Welcome Banner
      const welcomeBanner =
        `¡Hola ${clientName || ''}! 👋 Bienvenido a *${tenant.name}* 🗓️\n` +
        `¿En qué te podemos ayudar hoy?\n\n` +
        `1️⃣ *Reservar un Turno*\n` +
        `2️⃣ *Ver Servicios & Precios*\n` +
        `3️⃣ *Ver Mis Turnos Reservados*\n` +
        `4️⃣ *Link de Reserva Web 🌐*\n\n` +
        `Respondé con el número de opción (1, 2, 3 o 4).`;

      await sendEvolutionTextMessage(instanceName, clientPhone, welcomeBanner);
      saveSession(clientPhone, session);
      return;
    }

    // Step 2: Selecting Service
    if (session.step === 'SELECT_SERVICE') {
      const selectedIndex = parseInt(cleanText, 10) - 1;
      const activeServices = tenant.services.filter(s => s.active);

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= activeServices.length) {
        await sendEvolutionTextMessage(
          instanceName,
          clientPhone,
          `⚠️ Opción no válida. Por favor respondé con un número entre 1 y ${activeServices.length}.`
        );
        return;
      }

      const selectedService = activeServices[selectedIndex];
      session.selectedServiceId = selectedService.id;
      session.selectedServiceName = selectedService.name;
      session.selectedServicePrice = selectedService.price;

      // Prompt professional selection
      await promptProfessionalSelection(instanceName, clientPhone, tenant, session);
      return;
    }

    // Step 3: Selecting Professional
    if (session.step === 'SELECT_PROFESSIONAL') {
      const selectedIndex = parseInt(cleanText, 10) - 1;
      const activeProfessionals = tenant.professionals.filter(p => p.active);
      const totalOptions = activeProfessionals.length + 1; // +1 for "Sin preferencia"

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= totalOptions) {
        await sendEvolutionTextMessage(
          instanceName,
          clientPhone,
          `⚠️ Opción no válida. Por favor respondé con un número entre 1 y ${totalOptions}.`
        );
        return;
      }

      if (selectedIndex === 0) {
        session.selectedProfessionalId = 'any';
        session.selectedProfessionalName = 'Sin preferencia (Cualquiera disponible)';
      } else {
        const prof = activeProfessionals[selectedIndex - 1];
        session.selectedProfessionalId = prof.id;
        session.selectedProfessionalName = prof.name;
      }

      // Prompt Date Selection
      await promptDateSelection(instanceName, clientPhone, session);
      return;
    }

    // Step 4: Selecting Date
    if (session.step === 'SELECT_DATE') {
      const selectedIndex = parseInt(cleanText, 10) - 1;
      const datesList = getUpcomingDates(5);

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= datesList.length) {
        await sendEvolutionTextMessage(
          instanceName,
          clientPhone,
          `⚠️ Opción no válida. Respondé con un número entre 1 y ${datesList.length}.`
        );
        return;
      }

      session.selectedDate = datesList[selectedIndex].isoDate;

      // Prompt Time Selection
      await promptTimeSelection(instanceName, clientPhone, tenant, session);
      return;
    }

    // Step 5: Selecting Time Slot
    if (session.step === 'SELECT_TIME') {
      const selectedIndex = parseInt(cleanText, 10) - 1;
      const availableTimes = getAvailableTimeSlots();

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= availableTimes.length) {
        await sendEvolutionTextMessage(
          instanceName,
          clientPhone,
          `⚠️ Opción no válida. Respondé con el número de horario deseado.`
        );
        return;
      }

      const selectedTime = availableTimes[selectedIndex];
      session.selectedTime = selectedTime;

      // Ensure professional fallback
      let profId = session.selectedProfessionalId || 'any';
      if (profId === 'any' && tenant.professionals.length > 0) {
        profId = tenant.professionals[0].id;
      }

      // Create Appointment in DB
      const appointment = await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          serviceId: session.selectedServiceId!,
          professionalId: profId,
          clientName: clientName || 'Cliente WhatsApp',
          clientPhone: clientPhone,
          date: session.selectedDate!,
          time: selectedTime,
          status: 'confirmed'
        }
      });

      // Clear session
      clearSession(clientPhone);

      // Send Success Message
      const successMsg =
        `🎉 *¡TU TURNO HA SIDO CONFIRMADO!* 🎉\n\n` +
        `📍 *Comercio:* ${tenant.name}\n` +
        `✂️ *Servicio:* ${session.selectedServiceName}\n` +
        `👤 *Profesional:* ${session.selectedProfessionalName}\n` +
        `📅 *Fecha:* ${session.selectedDate}\n` +
        `⏰ *Hora:* ${selectedTime} hs\n` +
        `💵 *Precio:* $${(session.selectedServicePrice || 0).toLocaleString('es-AR')}\n\n` +
        `¡Te esperamos! Enviaremos un recordatorio 24 hs antes del turno. 🙌`;

      await sendEvolutionTextMessage(instanceName, clientPhone, successMsg);
    }

  } catch (error) {
    console.error('Error handling incoming WhatsApp bot message:', error);
  }
}

// Helpers
async function promptServiceSelection(instanceName: string, clientPhone: string, tenant: any, session: BotSessionState) {
  const activeServices = tenant.services.filter((s: any) => s.active);
  if (activeServices.length === 0) {
    await sendEvolutionTextMessage(instanceName, clientPhone, `⚠️ Este comercio no tiene servicios activos actualmente.`);
    return;
  }

  let text = `✂️ *Elegí el servicio que querés reservar:*\n\n`;
  activeServices.forEach((s: any, idx: number) => {
    text += `${idx + 1}. *${s.name}* ($${s.price.toLocaleString('es-AR')})\n`;
  });
  text += `\nRespondé con el número de tu opción (o *0* para cancelar).`;

  session.step = 'SELECT_SERVICE';
  saveSession(clientPhone, session);
  await sendEvolutionTextMessage(instanceName, clientPhone, text);
}

async function promptProfessionalSelection(instanceName: string, clientPhone: string, tenant: any, session: BotSessionState) {
  const activeProfessionals = tenant.professionals.filter((p: any) => p.active);
  let text = `👤 *Elegí al profesional:*\n\n`;
  text += `1. ⚡ *Sin preferencia* (Cualquier profesional disponible)\n`;

  activeProfessionals.forEach((p: any, idx: number) => {
    text += `${idx + 2}. *${p.name}* (${p.specialty})\n`;
  });

  text += `\nRespondé con el número de tu preferencia (o *0* para cancelar).`;

  session.step = 'SELECT_PROFESSIONAL';
  saveSession(clientPhone, session);
  await sendEvolutionTextMessage(instanceName, clientPhone, text);
}

async function promptDateSelection(instanceName: string, clientPhone: string, session: BotSessionState) {
  const upcomingDates = getUpcomingDates(5);
  let text = `📅 *¿Qué día preferís reservar?*\n\n`;
  upcomingDates.forEach((d, idx) => {
    text += `${idx + 1}. *${d.label}*\n`;
  });
  text += `\nRespondé con el número del día.`;

  session.step = 'SELECT_DATE';
  saveSession(clientPhone, session);
  await sendEvolutionTextMessage(instanceName, clientPhone, text);
}

async function promptTimeSelection(instanceName: string, clientPhone: string, tenant: any, session: BotSessionState) {
  const availableTimes = getAvailableTimeSlots();
  let text = `⏰ *Horarios disponibles para ${session.selectedDate}:*\n\n`;
  availableTimes.forEach((t, idx) => {
    text += `${idx + 1}. *${t} hs*\n`;
  });
  text += `\nRespondé con el número de la hora deseada.`;

  session.step = 'SELECT_TIME';
  saveSession(clientPhone, session);
  await sendEvolutionTextMessage(instanceName, clientPhone, text);
}

function getUpcomingDates(count: number) {
  const dates = [];
  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : daysOfWeek[d.getDay()];
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
    const isoDate = d.toISOString().split('T')[0];

    dates.push({
      label: `${dayName} (${dateStr})`,
      isoDate
    });
  }
  return dates;
}

function getAvailableTimeSlots() {
  return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
}
