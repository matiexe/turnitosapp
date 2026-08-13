import { Tenant, Professional, Service, Appointment, Client, SuperAdminStats, DaySchedule, TenantUser } from '@/types/saas';

export const INITIAL_TENANT_USERS: TenantUser[] = [
  { id: 'tu-1', tenantId: 't-1', name: 'Marcos Benítez', email: 'marcos@barberclub.com', role: 'admin', createdAt: '2026-01-15' },
  { id: 'tu-2', tenantId: 't-1', name: 'Sofia Recepción', email: 'recepcion@barberclub.com', role: 'receptionist', createdAt: '2026-02-01' },
  { id: 'tu-3', tenantId: 't-2', name: 'Dra. Valeria Gómez', email: 'valeria@esteticavital.com', role: 'admin', createdAt: '2026-02-01' }
];

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'lunes', label: 'Lunes', isOpen: true, openTime: '09:00', closeTime: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
  { day: 'martes', label: 'Martes', isOpen: true, openTime: '09:00', closeTime: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
  { day: 'miercoles', label: 'Miércoles', isOpen: true, openTime: '09:00', closeTime: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
  { day: 'jueves', label: 'Jueves', isOpen: true, openTime: '09:00', closeTime: '19:00', hasBreak: true, breakStart: '13:00', breakEnd: '14:00' },
  { day: 'viernes', label: 'Viernes', isOpen: true, openTime: '09:00', closeTime: '20:00', hasBreak: false },
  { day: 'sabado', label: 'Sábado', isOpen: true, openTime: '09:00', closeTime: '16:00', hasBreak: false },
  { day: 'domingo', label: 'Domingo', isOpen: false, openTime: '09:00', closeTime: '14:00', hasBreak: false }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 't-1',
    name: 'Barber Club Buenos Aires',
    slug: 'barber-club',
    rubro: 'peluqueria',
    ownerName: 'Marcos Benítez',
    ownerEmail: 'marcos@barberclub.com',
    phone: '+54 9 11 4521-8890',
    plan: 'pro',
    status: 'active',
    createdAt: '2026-01-15',
    slotIntervalMinutes: 30,
    schedule: DEFAULT_SCHEDULE,
    whatsappConfig: {
      instanceId: 'inst_barber_club',
      phoneNumber: '+54 9 11 4521-8890',
      status: 'connected',
      autoRemind24h: true,
      autoRemind2h: true,
      welcomeMessage: '¡Hola! Bienvenido a Barber Club. ¿Qué turno te gustaría reservar hoy?'
    }
  },
  {
    id: 't-2',
    name: 'Estética & Salud Vital',
    slug: 'estetica-vital',
    rubro: 'estetica',
    ownerName: 'Dra. Valeria Gómez',
    ownerEmail: 'valeria@esteticavital.com',
    phone: '+54 9 11 6712-4433',
    plan: 'enterprise',
    status: 'active',
    createdAt: '2026-02-01',
    slotIntervalMinutes: 45,
    schedule: DEFAULT_SCHEDULE,
    whatsappConfig: {
      instanceId: 'inst_estetica_vital',
      phoneNumber: '+54 9 11 6712-4433',
      status: 'connected',
      autoRemind24h: true,
      autoRemind2h: true,
      welcomeMessage: 'Hola 👋 Bienvenida a Estética Vital. Podés agendar tu sesión de tratamiento facial o corporal.'
    }
  },
  {
    id: 't-3',
    name: 'Consultorios Mente Sana',
    slug: 'mente-sana',
    rubro: 'psicologia',
    ownerName: 'Lic. Ignacio Rossi',
    ownerEmail: 'ignacio@mentesana.com',
    phone: '+54 9 11 3320-1122',
    plan: 'pro',
    status: 'active',
    createdAt: '2026-02-20',
    slotIntervalMinutes: 60,
    schedule: DEFAULT_SCHEDULE,
    whatsappConfig: {
      instanceId: 'inst_mente_sana',
      phoneNumber: '+54 9 11 3320-1122',
      status: 'qrcode_ready',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TURNOS_SAAS_DEMO_QR',
      autoRemind24h: true,
      autoRemind2h: false,
      welcomeMessage: 'Hola, espacio de atención psicológica. Por favor elegí tu horario para la primera entrevista o sesión de seguimiento.'
    }
  },
  {
    id: 't-4',
    name: 'Barbería El Gladiador',
    slug: 'barberia-gladiador',
    rubro: 'peluqueria',
    ownerName: 'Santiago Rossi',
    ownerEmail: 'santiago@gladiador.com',
    phone: '+54 9 11 8899-0011',
    plan: 'trial',
    status: 'active',
    createdAt: '2026-08-05',
    slotIntervalMinutes: 30,
    schedule: DEFAULT_SCHEDULE,
    whatsappConfig: {
      instanceId: 'inst_gladiador',
      status: 'disconnected',
      autoRemind24h: false,
      autoRemind2h: false,
      welcomeMessage: 'Hola gladiador, agendá tu corte en segundos.'
    }
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'p-1',
    tenantId: 't-1',
    name: 'Franco Barber',
    specialty: 'Corte Degradé & Barba',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    active: true
  },
  {
    id: 'p-2',
    tenantId: 't-1',
    name: 'Mateo Stylist',
    specialty: 'Tintura & Colorimetría',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    active: true
  },
  {
    id: 'p-3',
    tenantId: 't-2',
    name: 'Dra. Valeria Gómez',
    specialty: 'Dermatología Estética',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    active: true
  },
  {
    id: 'p-4',
    tenantId: 't-2',
    name: 'Lic. Camila Torres',
    specialty: 'Cosmiatría & Peeling',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    active: true
  },
  {
    id: 'p-5',
    tenantId: 't-3',
    name: 'Lic. Ignacio Rossi',
    specialty: 'Psicoanálisis & TCC',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    active: true
  }
];

export const INITIAL_SERVICES: Service[] = [
  // Peluquería
  { id: 's-1', tenantId: 't-1', name: 'Corte de Cabello + Peinado', durationMinutes: 35, price: 12000, category: 'Cabello', requireDeposit: false },
  { id: 's-2', tenantId: 't-1', name: 'Corte + Arreglo de Barba Royale', durationMinutes: 50, price: 17000, category: 'Combo', requireDeposit: false },
  { id: 's-3', tenantId: 't-1', name: 'Perfilado de Barba & Toalla Caliente', durationMinutes: 25, price: 8000, category: 'Barba', requireDeposit: false },
  
  // Estética
  { id: 's-4', tenantId: 't-2', name: 'Limpieza Facial Profunda + Punta de Diamante', durationMinutes: 60, price: 28000, category: 'Facial', requireDeposit: true, depositAmount: 10000 },
  { id: 's-5', tenantId: 't-2', name: 'Sesión Depilación Definitiva Láser Trío', durationMinutes: 45, price: 35000, category: 'Corporal', requireDeposit: true, depositAmount: 15000 },
  
  // Psicología
  { id: 's-6', tenantId: 't-3', name: 'Primera Entrevista / Diagnóstico', durationMinutes: 50, price: 20000, category: 'Individual', requireDeposit: false },
  { id: 's-7', tenantId: 't-3', name: 'Sesión de Terapia Individual (Semanal)', durationMinutes: 45, price: 18000, category: 'Individual', requireDeposit: false },
  { id: 's-8', tenantId: 't-3', name: 'Terapia de Pareja', durationMinutes: 60, price: 26000, category: 'Pareja', requireDeposit: false }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-101',
    tenantId: 't-1',
    professionalId: 'p-1',
    serviceId: 's-2',
    clientName: 'Lucas Fernández',
    clientPhone: '+54 9 11 5544-3322',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    status: 'confirmed',
    depositPaid: true,
    notes: 'Prefiere degradé bien marcado a cero.'
  },
  {
    id: 'app-102',
    tenantId: 't-1',
    professionalId: 'p-2',
    serviceId: 's-1',
    clientName: 'Gonzalo Pérez',
    clientPhone: '+54 9 11 9988-7766',
    date: new Date().toISOString().split('T')[0],
    time: '15:30',
    status: 'pending',
    depositPaid: false
  },
  {
    id: 'app-103',
    tenantId: 't-2',
    professionalId: 'p-3',
    serviceId: 's-4',
    clientName: 'Mariana Silva',
    clientPhone: '+54 9 11 2233-4455',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    status: 'confirmed',
    depositPaid: true,
    notes: 'Piel sensible, usar productos descongestivos.'
  },
  {
    id: 'app-104',
    tenantId: 't-3',
    professionalId: 'p-5',
    serviceId: 's-7',
    clientName: 'Nicolás Alvarez',
    clientPhone: '+54 9 11 6677-8899',
    date: new Date().toISOString().split('T')[0],
    time: '17:00',
    status: 'confirmed',
    depositPaid: true,
    isRecurring: true,
    notes: 'Sesión fija de los miércoles.'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c-1', tenantId: 't-1', name: 'Lucas Fernández', phone: '+54 9 11 5544-3322', totalAppointments: 8, notes: 'Cliente frecuente' },
  { id: 'c-2', tenantId: 't-1', name: 'Gonzalo Pérez', phone: '+54 9 11 9988-7766', totalAppointments: 2 },
  { id: 'c-3', tenantId: 't-2', name: 'Mariana Silva', phone: '+54 9 11 2233-4455', totalAppointments: 5, notes: 'Realiza tratamiento mensual' },
  { id: 'c-4', tenantId: 't-3', name: 'Nicolás Alvarez', phone: '+54 9 11 6677-8899', totalAppointments: 14, notes: 'Paciente recurrente' }
];

export function getInitialSuperAdminStats(tenants: Tenant[], appointments: Appointment[], clients: Client[]): SuperAdminStats {
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const connectedWhatsapp = tenants.filter(t => t.whatsappConfig.status === 'connected').length;
  const totalUsers = clients.length + 142;
  const totalApps = appointments.length + 580;

  return {
    totalTenants: tenants.length,
    activeTenants,
    totalUsersCount: totalUsers,
    totalAppointmentsCount: totalApps,
    connectedWhatsappRatio: Math.round((connectedWhatsapp / tenants.length) * 100),
    monthlyRevenue: tenants.length * 15000 + 45000
  };
}
