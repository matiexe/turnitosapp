export type RubroType = 'peluqueria' | 'estetica' | 'psicologia';

export type WhatsAppStatus = 'connected' | 'disconnected' | 'qrcode_ready';

export interface DaySchedule {
  day: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  label: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  hasBreak?: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface WhatsAppConfig {
  instanceId: string;
  phoneNumber?: string;
  status: WhatsAppStatus;
  qrCodeUrl?: string;
  autoRemind24h: boolean;
  autoRemind2h: boolean;
  welcomeMessage: string;
}

export interface Professional {
  id: string;
  tenantId: string;
  name: string;
  specialty: string;
  avatarUrl: string;
  active: boolean;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
  requireDeposit: boolean;
  depositAmount?: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  tenantId: string;
  professionalId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  depositPaid: boolean;
  notes?: string;
  isRecurring?: boolean;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  totalAppointments: number;
  notes?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string; // hex color e.g. '#10b981'
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  rubro: RubroType;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  plan: 'trial' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  createdAt: string;
  whatsappConfig: WhatsAppConfig;
  schedule: DaySchedule[];
  slotIntervalMinutes?: number;
  branding?: TenantBranding;
  hasCompletedOnboarding?: boolean;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: 'admin' | 'receptionist' | 'staff';
  createdAt: string;
}

export interface SuperAdminStats {
  totalTenants: number;
  activeTenants: number;
  totalUsersCount: number;
  totalAppointmentsCount: number;
  connectedWhatsappRatio: number;
  monthlyRevenue: number;
}
