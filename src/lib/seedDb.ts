import { prisma } from './prisma';

export async function ensureDbSeeded() {
  try {
    const tenantCount = await prisma.tenant.count();
    if (tenantCount > 0) return; // DB already has data

    console.log('Seeding initial business data into SQLite database...');

    // 1. Barber Club
    const barberTenant = await prisma.tenant.create({
      data: {
        id: 't-1',
        name: 'Barber Club Buenos Aires',
        slug: 'barber-club',
        rubro: 'peluqueria',
        ownerName: 'Marcos Benítez',
        ownerEmail: 'marcos@barberclub.com',
        phone: '+54 9 11 4521-8890',
        plan: 'pro',
        status: 'active',
        slotIntervalMinutes: 30,
        logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150',
        bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200',
        primaryColor: '#10b981',
        hasCompletedOnboarding: true,
        whatsappInstanceId: 'inst_barber_club',
        whatsappPhoneNumber: '+54 9 11 4521-8890',
        whatsappStatus: 'connected',
        whatsappWelcomeMessage: '¡Hola! Bienvenido a Barber Club. ¿Qué turno te gustaría reservar hoy?'
      }
    });

    // Barber Club Services
    await prisma.service.createMany({
      data: [
        { id: 's-1', tenantId: barberTenant.id, name: 'Corte de Cabello Masculino & Styling', durationMinutes: 30, price: 12000, active: true },
        { id: 's-2', tenantId: barberTenant.id, name: 'Barba Completa con Ritual de Toalla Caliente', durationMinutes: 30, price: 9000, active: true },
        { id: 's-3', tenantId: barberTenant.id, name: 'Combo VIP: Corte + Barba + Bebida de Cortesía', durationMinutes: 60, price: 19000, active: true }
      ]
    });

    // Barber Club Professionals
    await prisma.professional.createMany({
      data: [
        { id: 'p-1', tenantId: barberTenant.id, name: 'Franco "Barber" Stylist', specialty: 'Cortes Fades & Diseños', active: true, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
        { id: 'p-2', tenantId: barberTenant.id, name: 'Lucas "Master" Miller', specialty: 'Perfilado de Barbas & Navaja', active: true, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
      ]
    });

    // Barber Club Clients
    await prisma.client.createMany({
      data: [
        { id: 'c-1', tenantId: barberTenant.id, name: 'Agustín Fernández', phone: '+54 9 11 3322-1100', totalAppointments: 3, notes: 'Prefiere fade bajo' },
        { id: 'c-2', tenantId: barberTenant.id, name: 'Nicolás Gómez', phone: '+54 9 11 8877-6655', totalAppointments: 2, notes: 'Cliente frecuente viernes' }
      ]
    });

    // Barber Club Appointments
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.appointment.createMany({
      data: [
        { id: 'a-1', tenantId: barberTenant.id, professionalId: 'p-1', serviceId: 's-1', clientName: 'Agustín Fernández', clientPhone: '+54 9 11 3322-1100', date: todayStr, time: '14:00', status: 'confirmed', depositPaid: true, notes: 'Puntual' },
        { id: 'a-2', tenantId: barberTenant.id, professionalId: 'p-2', serviceId: 's-3', clientName: 'Nicolás Gómez', clientPhone: '+54 9 11 8877-6655', date: todayStr, time: '15:30', status: 'pending', depositPaid: false }
      ]
    });

    // 2. Estética & Salud Vital
    const esteticaTenant = await prisma.tenant.create({
      data: {
        id: 't-2',
        name: 'Estética & Salud Vital',
        slug: 'estetica-vital',
        rubro: 'estetica',
        ownerName: 'Dra. Valeria Gómez',
        ownerEmail: 'valeria@esteticavital.com',
        phone: '+54 9 11 6712-4433',
        plan: 'enterprise',
        status: 'active',
        slotIntervalMinutes: 45,
        logoUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150',
        bannerUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
        primaryColor: '#ec4899',
        hasCompletedOnboarding: true,
        whatsappInstanceId: 'inst_estetica_vital',
        whatsappPhoneNumber: '+54 9 11 6712-4433',
        whatsappStatus: 'connected',
        whatsappWelcomeMessage: 'Hola 👋 Bienvenida a Estética Vital. Podés agendar tu sesión de tratamiento facial o corporal.'
      }
    });

    await prisma.service.createMany({
      data: [
        { id: 's-4', tenantId: esteticaTenant.id, name: 'Limpieza Facial Profunda con Punta de Diamante', durationMinutes: 45, price: 22000, active: true },
        { id: 's-5', tenantId: esteticaTenant.id, name: 'Masaje Descontracturante & Piedras Calientes', durationMinutes: 60, price: 28000, active: true }
      ]
    });

    await prisma.professional.createMany({
      data: [
        { id: 'p-3', tenantId: esteticaTenant.id, name: 'Dra. Valeria Gómez', specialty: 'Medicina Estética & Dermatología', active: true, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' }
      ]
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
