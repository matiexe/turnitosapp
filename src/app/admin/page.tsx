'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  PlusCircle, 
  MessageSquare, 
  QrCode, 
  Scissors, 
  Sparkles, 
  Brain, 
  Settings, 
  Users, 
  Briefcase, 
  DollarSign, 
  ChevronRight, 
  ExternalLink,
  ShieldAlert,
  Search,
  Check,
  AlertCircle,
  FileText,
  BarChart3,
  TrendingUp,
  LogOut,
  UserPlus,
  KeyRound,
  UserCheck,
  Palette,
  Image as ImageIcon,
  Copy,
  CopyCheck,
  Building,
  User as UserIcon,
  Lock,
  Rocket
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tenant, Appointment, Service, Professional, Client, RubroType, DaySchedule, TenantUser } from '@/types/saas';
import { 
  INITIAL_TENANTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_SERVICES, 
  INITIAL_PROFESSIONALS, 
  INITIAL_CLIENTS,
  INITIAL_TENANT_USERS,
  DEFAULT_SCHEDULE 
} from '@/lib/mockStore';

function TenantAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantIdParam = searchParams?.get('tenant');

  // State
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'configuracion' | 'clientes'>('dashboard');
  const [configSubTab, setConfigSubTab] = useState<'general' | 'branding' | 'services' | 'horarios' | 'whatsapp' | 'profile'>('general');
  const [currentUserRole, setCurrentUserRole] = useState<'superadmin' | 'tenant_admin' | 'guest'>('tenant_admin');

  // Business Data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);

  // User Access Modal Form
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'receptionist'>('receptionist');

  const handleLogout = () => {
    localStorage.removeItem('tuturnito_current_user');
    router.push('/login');
  };

  const handleSaveTenantUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !currentTenant) return;

    const newUser: TenantUser = {
      id: `tu-${Date.now()}`,
      tenantId: currentTenant.id,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newUser, ...tenantUsers];
    setTenantUsers(updated);
    localStorage.setItem('saas_tenant_users', JSON.stringify(updated));

    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserModalOpen(false);
  };

  // Agenda Filter & Search State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedProfessionalFilter, setSelectedProfessionalFilter] = useState<string>('all');
  const [agendaViewMode, setAgendaViewMode] = useState<'daily' | 'weekly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  // Business & User Profile Settings State
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editBusinessPhone, setEditBusinessPhone] = useState('');
  const [editBusinessSlug, setEditBusinessSlug] = useState('');
  const [userProfileName, setUserProfileName] = useState('');
  const [tenantSaveMsg, setTenantSaveMsg] = useState('');
  const [profileSaveMsg, setProfileSaveMsg] = useState('');

  // Reset Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Onboarding Wizard State (5 Pasos con opción de omitir)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [obServiceName, setObServiceName] = useState('');
  const [obServicePrice, setObServicePrice] = useState('');
  const [obServiceDuration, setObServiceDuration] = useState('30');

  const handleCopyBookingLink = () => {
    if (!currentTenant) return;
    const url = `${window.location.origin}/reserva/${currentTenant.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveTenantInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    const updatedTenant: Tenant = {
      ...currentTenant,
      name: editBusinessName || currentTenant.name,
      phone: editBusinessPhone || currentTenant.phone,
      slug: editBusinessSlug || currentTenant.slug
    };
    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));

    try {
      await fetch(`/api/tenants/${currentTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedTenant.name,
          phone: updatedTenant.phone,
          slug: updatedTenant.slug
        })
      });
    } catch (e) {}

    setTenantSaveMsg('¡Datos del negocio guardados con éxito!');
    setTimeout(() => setTenantSaveMsg(''), 3000);
  };

  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    const updatedTenant: Tenant = {
      ...currentTenant,
      ownerName: userProfileName || currentTenant.ownerName
    };
    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));

    try {
      await fetch(`/api/tenants/${currentTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerName: updatedTenant.ownerName })
      });
    } catch (e) {}

    setProfileSaveMsg('¡Nombre de usuario actualizado con éxito!');
    setTimeout(() => setProfileSaveMsg(''), 3000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setPasswordSuccessMsg('¡Contraseña actualizada con éxito!');
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccessMsg('');
    }, 1200);
  };

  const handleCompleteOnboarding = async () => {
    if (!currentTenant) return;
    const updatedTenant: Tenant = {
      ...currentTenant,
      hasCompletedOnboarding: true
    };
    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));

    try {
      await fetch(`/api/tenants/${currentTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasCompletedOnboarding: true })
      });
    } catch (e) {}
  };

  const getWeekDates = (baseDateStr: string) => {
    const dateObj = new Date(baseDateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() + distanceToMonday);

    const weekDays: { dateStr: string; label: string; dayName: string; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const dayLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      weekDays.push({
        dateStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        dayName: dayLabels[i],
        isToday: dateStr === todayStr
      });
    }

    return weekDays;
  };

  // Modals State
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  // New Appointment Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState('');
  const [newProfessionalId, setNewProfessionalId] = useState('');
  const [newTime, setNewTime] = useState('16:00');
  const [newNotes, setNewNotes] = useState('');

  // New Service Form
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(10000);

  // Professional Form
  const [profName, setProfName] = useState('');
  const [profSpecialty, setProfSpecialty] = useState('');
  const [profAvatarUrl, setProfAvatarUrl] = useState('');

  useEffect(() => {
    // Check User Session Role & Active Tenant ID
    let sessionTenantId: string | null = null;
    const userSession = localStorage.getItem('tuturnito_current_user');
    if (userSession) {
      try {
        const u = JSON.parse(userSession);
        if (u.role === 'superadmin') {
          setCurrentUserRole('superadmin');
        } else {
          setCurrentUserRole('tenant_admin');
          if (u.tenantId) sessionTenantId = u.tenantId;
        }
      } catch (e) {}
    }

    async function loadDataFromDb() {
      try {
        const res = await fetch('/api/tenants');
        const data = await res.json();
        if (data.success && data.tenants && data.tenants.length > 0) {
          const loadedTenants: Tenant[] = data.tenants;
          setTenants(loadedTenants);
          localStorage.setItem('saas_tenants', JSON.stringify(loadedTenants));

          const targetId = tenantIdParam || sessionTenantId;
          const found = (targetId ? loadedTenants.find(t => t.id === targetId) : null) || loadedTenants[0];
          if (found) {
            setCurrentTenant(found);
            setEditBusinessName(found.name);
            setEditBusinessPhone(found.phone);
            setEditBusinessSlug(found.slug);
            setUserProfileName(found.ownerName);
          } else {
            setCurrentTenant(loadedTenants[0] || INITIAL_TENANTS[0]);
          }
        } else {
          // Fallback to local storage or INITIAL_TENANTS
          const savedTenants = localStorage.getItem('saas_tenants');
          const loadedTenants: Tenant[] = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;
          setTenants(loadedTenants);
          const targetId = tenantIdParam || sessionTenantId;
          const found = (targetId ? loadedTenants.find(t => t.id === targetId) : null) || loadedTenants[0] || INITIAL_TENANTS[0];
          setCurrentTenant(found);
        }
      } catch (err) {
        console.error('API load error, using cached storage:', err);
        const savedTenants = localStorage.getItem('saas_tenants');
        const loadedTenants: Tenant[] = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;
        setTenants(loadedTenants);
        const targetId = tenantIdParam || sessionTenantId;
        const found = (targetId ? loadedTenants.find(t => t.id === targetId) : null) || loadedTenants[0] || INITIAL_TENANTS[0];
        setCurrentTenant(found);
      }
    }

    loadDataFromDb();

    // Load Appointments, Services, Professionals
    const savedApps = localStorage.getItem('saas_appointments');
    setAppointments(savedApps ? JSON.parse(savedApps) : INITIAL_APPOINTMENTS);

    const savedServs = localStorage.getItem('saas_services');
    setServices(savedServs ? JSON.parse(savedServs) : INITIAL_SERVICES);

    const savedProfs = localStorage.getItem('saas_professionals');
    setProfessionals(savedProfs ? JSON.parse(savedProfs) : INITIAL_PROFESSIONALS);

    const savedClients = localStorage.getItem('saas_clients');
    setClients(savedClients ? JSON.parse(savedClients) : INITIAL_CLIENTS);

    const savedTenantUsers = localStorage.getItem('saas_tenant_users');
    setTenantUsers(savedTenantUsers ? JSON.parse(savedTenantUsers) : INITIAL_TENANT_USERS);
  }, [tenantIdParam]);

  if (!currentTenant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 animate-pulse">
          <Rocket size={28} />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white tracking-tight">Cargando Panel de tu Negocio...</h3>
          <p className="text-xs text-slate-400">tuturnito<span className="text-emerald-400">.app</span></p>
        </div>
      </div>
    );
  }

  const tenantServices = services.filter(s => s.tenantId === currentTenant.id);
  const tenantProfessionals = professionals.filter(p => p.tenantId === currentTenant.id);
  const tenantAppointments = appointments.filter(a => a.tenantId === currentTenant.id);
  const tenantClients = clients.filter(c => c.tenantId === currentTenant.id);

  // Filter Appointments by Date, Professional, Status & Search Query
  const filteredAppointments = tenantAppointments.filter(app => {
    const matchesDate = app.date === selectedDate;
    const matchesProf = selectedProfessionalFilter === 'all' || app.professionalId === selectedProfessionalFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      app.clientName.toLowerCase().includes(q) || 
      app.clientPhone.includes(q);

    return matchesDate && matchesProf && matchesStatus && matchesSearch;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppsCount = tenantAppointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;

  const saveAppointments = (updated: Appointment[]) => {
    setAppointments(updated);
    localStorage.setItem('saas_appointments', JSON.stringify(updated));
  };

  const handleStatusChange = (appId: string, status: Appointment['status']) => {
    const updated = appointments.map(app => app.id === appId ? { ...app, status } : app);
    saveAppointments(updated);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone || !newServiceId) return;

    const assignedProfId = (newProfessionalId && newProfessionalId !== 'any') 
      ? newProfessionalId 
      : (tenantProfessionals[0]?.id || 'p-1');

    // Check if slot is already occupied for this professional
    const isOccupied = appointments.some(app => 
      app.tenantId === currentTenant.id && 
      app.date === selectedDate && 
      app.time === newTime && 
      app.professionalId === assignedProfId && 
      app.status !== 'cancelled'
    );

    if (isOccupied) {
      alert(`⚠️ El horario de las ${newTime} hs ya cuenta con un turno reservado para este profesional.`);
      return;
    }

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      tenantId: currentTenant.id,
      professionalId: assignedProfId,
      serviceId: newServiceId,
      clientName: newClientName,
      clientPhone: newClientPhone,
      date: selectedDate,
      time: newTime,
      status: 'confirmed',
      depositPaid: false,
      notes: newNotes
    };

    saveAppointments([newApp, ...appointments]);

    // Reset Form
    setNewClientName('');
    setNewClientPhone('');
    setNewNotes('');
    setIsAddAppointmentOpen(false);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;

    const newServ: Service = {
      id: `s-${Date.now()}`,
      tenantId: currentTenant.id,
      name: newServiceName,
      durationMinutes: Number(newServiceDuration),
      price: Number(newServicePrice),
      category: 'General',
      requireDeposit: false
    };

    const updated = [newServ, ...services];
    setServices(updated);
    localStorage.setItem('saas_services', JSON.stringify(updated));

    setNewServiceName('');
    setIsAddServiceOpen(false);
  };

  const handleSaveProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName || !currentTenant) return;

    const avatar = profAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    if (editingProfessional) {
      const updated = professionals.map(p => p.id === editingProfessional.id ? {
        ...p,
        name: profName,
        specialty: profSpecialty || 'Especialista',
        avatarUrl: avatar
      } : p);
      setProfessionals(updated);
      localStorage.setItem('saas_professionals', JSON.stringify(updated));
    } else {
      const newProf: Professional = {
        id: `p-${Date.now()}`,
        tenantId: currentTenant.id,
        name: profName,
        specialty: profSpecialty || 'Especialista',
        avatarUrl: avatar,
        active: true
      };
      const updated = [newProf, ...professionals];
      setProfessionals(updated);
      localStorage.setItem('saas_professionals', JSON.stringify(updated));
    }

    setProfName('');
    setProfSpecialty('');
    setProfAvatarUrl('');
    setEditingProfessional(null);
    setIsProfessionalModalOpen(false);
  };

  const handleOpenEditProfessional = (p: Professional) => {
    setEditingProfessional(p);
    setProfName(p.name);
    setProfSpecialty(p.specialty);
    setProfAvatarUrl(p.avatarUrl);
    setIsProfessionalModalOpen(true);
  };

  const handleDeleteProfessional = (pId: string) => {
    if (!confirm('¿Estás seguro de eliminar a este profesional del equipo?')) return;
    const updated = professionals.filter(p => p.id !== pId);
    setProfessionals(updated);
    localStorage.setItem('saas_professionals', JSON.stringify(updated));
  };

  const handleToggleProfessionalActive = (pId: string) => {
    const updated = professionals.map(p => p.id === pId ? { ...p, active: !p.active } : p);
    setProfessionals(updated);
    localStorage.setItem('saas_professionals', JSON.stringify(updated));
  };

  const toggleWhatsAppConnection = () => {
    const nextStatus = currentTenant.whatsappConfig.status === 'connected' ? 'disconnected' : 'connected';
    const updatedTenant: Tenant = {
      ...currentTenant,
      whatsappConfig: {
        ...currentTenant.whatsappConfig,
        status: nextStatus,
        phoneNumber: nextStatus === 'connected' ? (currentTenant.phone || '+54 9 11 1234-5678') : undefined
      }
    };

    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));
  };

  const handleDeleteService = (serviceId: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    const updated = services.filter(s => s.id !== serviceId);
    setServices(updated);
    localStorage.setItem('saas_services', JSON.stringify(updated));
  };

  const handleUpdateWhatsappConfig = (key: keyof Tenant['whatsappConfig'], value: any) => {
    if (!currentTenant) return;
    const updatedWhatsapp = {
      ...currentTenant.whatsappConfig,
      [key]: value
    };
    const updatedTenant: Tenant = {
      ...currentTenant,
      whatsappConfig: updatedWhatsapp
    };
    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));
  };

  const getRubroIcon = (rubro: RubroType) => {
    switch (rubro) {
      case 'peluqueria': return <Scissors size={16} className="text-amber-400" />;
      case 'estetica': return <Sparkles size={16} className="text-pink-400" />;
      case 'psicologia': return <Brain size={16} className="text-teal-400" />;
    }
  };

  const handleUpdateScheduleDay = (index: number, key: keyof DaySchedule, value: any) => {
    if (!currentTenant) return;
    const currentSchedule = currentTenant.schedule || DEFAULT_SCHEDULE;
    const updatedSchedule = currentSchedule.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: value };
      }
      return item;
    });

    const updatedTenant: Tenant = {
      ...currentTenant,
      schedule: updatedSchedule
    };
    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));
  };

  const handleUpdateInterval = (interval: number) => {
    if (!currentTenant) return;
    const updatedTenant: Tenant = {
      ...currentTenant,
      slotIntervalMinutes: interval
    };
    setCurrentTenant(updatedTenant);
    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));
  };

  const handleUpdateBranding = async (field: 'logoUrl' | 'bannerUrl' | 'primaryColor', value: string) => {
    if (!currentTenant) return;
    const currentBranding = currentTenant.branding || {};
    const updatedBranding = { ...currentBranding, [field]: value };
    const updatedTenant: Tenant = { ...currentTenant, branding: updatedBranding };
    setCurrentTenant(updatedTenant);

    const updatedTenants = tenants.map(t => t.id === currentTenant.id ? updatedTenant : t);
    setTenants(updatedTenants);
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));

    try {
      await fetch(`/api/tenants/${currentTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branding: updatedBranding,
          logoUrl: updatedBranding.logoUrl,
          bannerUrl: updatedBranding.bannerUrl,
          primaryColor: updatedBranding.primaryColor
        })
      });
    } catch (e) {
      console.error('Error saving branding to DB:', e);
    }
  };

  const handleImageUpload = (field: 'logoUrl' | 'bannerUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('⚠️ La imagen seleccionada supera los 4MB. Por favor seleccioná una imagen más liviana.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleUpdateBranding(field, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const activeSchedule = currentTenant.schedule || DEFAULT_SCHEDULE;

  // Business Dashboard Metrics Calculations
  const totalAppsCount = tenantAppointments.length;
  const confirmedAppsCount = tenantAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
  const cancelledAppsCount = tenantAppointments.filter(a => a.status === 'cancelled').length;
  const attendanceRate = totalAppsCount > 0 
    ? Math.round((confirmedAppsCount / totalAppsCount) * 100) 
    : 100;

  const totalEstimatedRevenue = tenantAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => {
      const s = services.find(serv => serv.id === a.serviceId);
      return sum + (s ? s.price : 0);
    }, 0);

  const serviceStats = tenantServices.map(s => {
    const count = tenantAppointments.filter(a => a.serviceId === s.id && a.status !== 'cancelled').length;
    return { ...s, count };
  }).sort((a, b) => b.count - a.count);

  const profStats = tenantProfessionals.map(p => {
    const count = tenantAppointments.filter(a => a.professionalId === p.id && a.status !== 'cancelled').length;
    return { ...p, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-36 sm:pb-32">
      {/* existing top bar... */}

      
      {/* Mobile-First Top Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Tenant Switcher & Info */}
          <div className="flex items-center gap-3">
            {currentTenant.branding?.logoUrl ? (
              /* eslint-disable-next-html-next-element */
              <img
                src={currentTenant.branding.logoUrl}
                alt={currentTenant.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                {currentTenant.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                {(currentUserRole === 'superadmin' || tenantIdParam === 'demo') ? (
                  <select
                    value={currentTenant.id}
                    onChange={(e) => {
                      const target = tenants.find(t => t.id === e.target.value);
                      if (target) setCurrentTenant(target);
                    }}
                    className="bg-transparent font-bold text-white text-base focus:outline-none cursor-pointer border-none p-0 pr-2 max-w-[140px] sm:max-w-xs truncate"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                        {t.name} ({t.rubro})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-white text-base max-w-[160px] sm:max-w-xs truncate block">
                    {currentTenant.name}
                  </span>
                )}
                {getRubroIcon(currentTenant.rubro)}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  currentTenant.whatsappConfig.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}></span>
                <span>WhatsApp: <strong>{currentTenant.whatsappConfig.status === 'connected' ? 'Conectado' : 'Sin QR'}</strong></span>
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            {currentUserRole === 'superadmin' && (
              <Link
                href="/superadmin"
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition"
                title="Volver al Panel Super Admin"
              >
                <Settings size={18} />
              </Link>
            )}

            <button
              onClick={handleCopyBookingLink}
              className="px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl border border-emerald-500/20 transition flex items-center gap-1.5 shadow-sm"
              title="Copiar link de reserva por WhatsApp"
            >
              {copiedLink ? <CopyCheck size={15} className="text-emerald-400" /> : <Copy size={15} />}
              <span>{copiedLink ? '¡Copiado!' : 'Copiar Link'}</span>
            </button>

            <Link
              href={`/reserva/${currentTenant.slug}`}
              target="_blank"
              className="px-2.5 py-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border border-indigo-500/20 transition flex items-center gap-1.5 shadow-sm"
              title="Abrir página pública de reserva"
            >
              <ExternalLink size={15} />
              <span className="hidden sm:inline">Ver Reserva</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 transition flex items-center gap-1.5"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6 pb-36">

        {/* TAB 1: AGENDA DE TURNOS */}
        {activeTab === 'agenda' && (
          <div className="space-y-4">
            
            {/* Header & Date Selector */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-indigo-400" /> Agenda de Turnos
                </h2>
                <p className="text-xs text-slate-400">Gestioná los turnos del negocio desde tu celular</p>
              </div>

              {/* View Mode Pills (Diaria vs Semanal) */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                  <button
                    onClick={() => setAgendaViewMode('daily')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      agendaViewMode === 'daily' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📅 Vista Diaria
                  </button>
                  <button
                    onClick={() => setAgendaViewMode('weekly')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      agendaViewMode === 'weekly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🗓️ Vista Semanal
                  </button>
                </div>

                <button
                  onClick={() => setIsAddAppointmentOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition"
                >
                  <PlusCircle size={15} /> Nuevo
                </button>
              </div>
            </div>

            {/* Quick Date & Professional Filters Bar */}
            <div className="glass-card p-3 rounded-2xl flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
                >
                  Hoy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Profesional:</span>
                <select
                  value={selectedProfessionalFilter}
                  onChange={(e) => setSelectedProfessionalFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="all">Todos ({tenantProfessionals.length})</option>
                  {tenantProfessionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search & Status Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar cliente o celular..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'confirmed', label: '🟢 Confirmados' },
                  { id: 'pending', label: '🟡 Pendientes' },
                  { id: 'completed', label: '🔵 Completados' },
                  { id: 'cancelled', label: '🔴 Cancelados' }
                ].map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border ${
                      statusFilter === chip.id
                        ? 'bg-slate-800 text-white border-slate-700 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border-slate-900 hover:text-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VISTA SEMANAL GRID */}
            {agendaViewMode === 'weekly' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold">
                  <span>Semana del {getWeekDates(selectedDate)[0].label} al {getWeekDates(selectedDate)[6].label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate + 'T00:00:00');
                        d.setDate(d.getDate() - 7);
                        setSelectedDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                    >
                      ← Semana Anterior
                    </button>
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate + 'T00:00:00');
                        d.setDate(d.getDate() + 7);
                        setSelectedDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                    >
                      Semana Siguiente →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                  {getWeekDates(selectedDate).map((day) => {
                    const dayApps = tenantAppointments.filter(app => 
                      app.date === day.dateStr &&
                      app.status !== 'cancelled' &&
                      (selectedProfessionalFilter === 'all' || app.professionalId === selectedProfessionalFilter)
                    );

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => {
                          setSelectedDate(day.dateStr);
                          setAgendaViewMode('daily');
                        }}
                        className={`glass-card p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                          day.isToday 
                            ? 'border-indigo-500/80 bg-indigo-500/5 shadow-md' 
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                          <div>
                            <span className="text-xs font-bold text-white block">{day.dayName}</span>
                            <span className="text-[11px] text-slate-400">{day.label}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            dayApps.length > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {dayApps.length} turnos
                          </span>
                        </div>

                        <div className="space-y-1.5 min-h-20">
                          {dayApps.length === 0 ? (
                            <p className="text-[11px] text-slate-600 italic text-center py-4">Sin turnos</p>
                          ) : (
                            dayApps.map(app => {
                              const service = tenantServices.find(s => s.id === app.serviceId);
                              return (
                                <div key={app.id} className="p-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-indigo-400">{app.time}</span>
                                    <span className={`w-2 h-2 rounded-full ${
                                      app.status === 'confirmed' ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`} />
                                  </div>
                                  <p className="font-semibold text-white truncate">{app.clientName}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{service?.name}</p>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="pt-2 text-center border-t border-slate-800/40">
                          <span className="text-[10px] text-indigo-400 font-semibold group-hover:underline">Ver Día →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* VISTA DIARIA (DÍA ESPECÍFICO) */}
            {agendaViewMode === 'daily' && (
              <>
                {/* Appointments List */}
                <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="glass-card p-10 rounded-2xl text-center text-slate-400 space-y-2">
                  <Calendar size={36} className="mx-auto text-slate-600 opacity-60" />
                  <p className="text-sm font-medium">No hay turnos registrados para este día.</p>
                  <button
                    onClick={() => setIsAddAppointmentOpen(true)}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    + Agendar primer turno manualmente
                  </button>
                </div>
              ) : (
                filteredAppointments.map((app) => {
                  const service = tenantServices.find(s => s.id === app.serviceId);
                  const prof = tenantProfessionals.find(p => p.id === app.professionalId);

                  return (
                    <div 
                      key={app.id}
                      className="glass-card p-4 rounded-2xl space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                            <span className="text-sm font-black text-indigo-400 block">{app.time}</span>
                            <span className="text-[10px] text-slate-400 block">{service?.durationMinutes || 30} min</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{app.clientName}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>✂️ {service?.name}</span>
                              <span>•</span>
                              <span>👤 {prof?.name}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          app.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          app.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          app.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {app.notes && (
                        <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          📝 <strong>Nota:</strong> {app.notes}
                        </p>
                      )}

                      {/* Touch Quick Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <a
                          href={`https://wa.me/${app.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hola ${app.clientName}! Te recordamos tu turno en ${currentTenant.name} para hoy a las ${app.time}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <MessageSquare size={14} /> Enviar Recordatorio WhatsApp
                        </a>

                        <div className="flex items-center gap-1.5">
                          {app.status !== 'confirmed' && (
                            <button
                              onClick={() => handleStatusChange(app.id, 'confirmed')}
                              className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-medium"
                            >
                              Confirmar
                            </button>
                          )}
                          {app.status !== 'completed' && (
                            <button
                              onClick={() => handleStatusChange(app.id, 'completed')}
                              className="px-2.5 py-1 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-xs font-medium"
                            >
                              Completar
                            </button>
                          )}
                          {app.status !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(app.id, 'cancelled')}
                              className="px-2.5 py-1 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-xs font-medium"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
              </>
            )}

          </div>
        )}

        {/* TAB: DASHBOARD / MÉTRICAS DEL NEGOCIO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-400" /> Dashboard y Métricas de {currentTenant.name}
              </h2>
              <p className="text-xs text-slate-400">Resumen de ingresos estimados, asistencia de clientes y rendimiento del equipo</p>
            </div>

            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Facturación Est.</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">${totalEstimatedRevenue.toLocaleString('es-AR')}</p>
                <p className="text-[10px] text-slate-400">Ingresos proyectados</p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Turnos Totales</span>
                <p className="text-xl sm:text-2xl font-black text-white">{totalAppsCount}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">{confirmedAppsCount} confirmados</p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tasa Asistencia</span>
                <p className="text-xl sm:text-2xl font-black text-indigo-400">{attendanceRate}%</p>
                <p className="text-[10px] text-slate-400">Asistencia efectiva</p>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clientes Únicos</span>
                <p className="text-xl sm:text-2xl font-black text-teal-400">{tenantClients.length}</p>
                <p className="text-[10px] text-slate-400">Cartera activa</p>
              </div>
            </div>

            {/* Top Services & Professional Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Top Services */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Scissors size={16} /> Servicios Más Solicitados
                </h3>

                <div className="space-y-2.5">
                  {serviceStats.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No hay datos de servicios aún.</p>
                  ) : (
                    serviceStats.map(s => (
                      <div key={s.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-white truncate max-w-[180px]">{s.name}</span>
                          <span className="text-slate-400">{s.count} turnos (${(s.count * s.price).toLocaleString('es-AR')})</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(100, Math.max(8, (s.count / (totalAppsCount || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Team Performance */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Users size={16} /> Rendimiento por Profesional
                </h3>

                <div className="space-y-2.5">
                  {profStats.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No hay profesionales registrados.</p>
                  ) : (
                    profStats.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-html-next-element */}
                          <img src={p.avatarUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-white block truncate max-w-[140px]">{p.name}</span>
                            <span className="text-[10px] text-slate-400">{p.specialty}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-indigo-400">{p.count} turnos</span>
                          <span className="text-[10px] text-slate-400 block">{totalAppsCount > 0 ? Math.round((p.count / totalAppsCount) * 100) : 0}% del total</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}



        {/* TAB: CONFIGURACIÓN GENERAL CON MENÚ INTERNO */}
        {activeTab === 'configuracion' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-indigo-400" /> Configuración del Negocio
              </h2>
              <p className="text-xs text-slate-400">Navegá entre las opciones para personalizar tu comercio, servicios, horarios y WhatsApp</p>
            </div>

            {/* Sub-Menú de Navegación dentro de Config. */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
              <button
                type="button"
                onClick={() => setConfigSubTab('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  configSubTab === 'general'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Building size={14} /> Datos del Comercio
              </button>

              <button
                type="button"
                onClick={() => setConfigSubTab('branding')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  configSubTab === 'branding'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Palette size={14} /> Personalización & Marca
              </button>

              <button
                type="button"
                onClick={() => setConfigSubTab('services')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  configSubTab === 'services'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Briefcase size={14} /> Servicios & Precios
              </button>

              <button
                type="button"
                onClick={() => setConfigSubTab('horarios')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  configSubTab === 'horarios'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Clock size={14} /> Días & Horarios
              </button>

              <button
                type="button"
                onClick={() => setConfigSubTab('whatsapp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  configSubTab === 'whatsapp'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <MessageSquare size={14} /> WhatsApp & Avisos
              </button>

              <button
                type="button"
                onClick={() => setConfigSubTab('profile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  configSubTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <UserIcon size={14} /> Mi Perfil
              </button>
            </div>

            {/* SUB-TAB 1: DATOS DEL NEGOCIO & USUARIOS DE ACCESO */}
            {configSubTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <form onSubmit={handleSaveTenantInfo} className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building size={16} className="text-emerald-400" /> Datos de la Empresa / Comercio
                    </h3>
                    {tenantSaveMsg && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        {tenantSaveMsg}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Nombre del Negocio</label>
                      <input
                        type="text"
                        value={editBusinessName}
                        onChange={(e) => setEditBusinessName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">WhatsApp de Contacto / Consultas</label>
                      <input
                        type="text"
                        value={editBusinessPhone}
                        onChange={(e) => setEditBusinessPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Slug de URL Pública (`tuturnito.app/reserva/[slug]`)</label>
                      <input
                        type="text"
                        value={editBusinessSlug}
                        onChange={(e) => setEditBusinessSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Rubro del Negocio</label>
                      <input
                        type="text"
                        disabled
                        value={currentTenant.rubro.toUpperCase()}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition"
                    >
                      Guardar Datos del Negocio
                    </button>
                  </div>
                </form>

                {/* Business Users Section */}
                <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <UserCheck size={16} className="text-emerald-400" /> Usuarios con Acceso al Panel ({tenantUsers.filter(u => u.tenantId === currentTenant.id).length})
                      </h3>
                      <p className="text-xs text-slate-400">Personal autorizado para administrar la agenda y turnos</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewUserName('');
                        setNewUserEmail('');
                        setIsAddUserModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition flex items-center gap-1.5"
                    >
                      <UserPlus size={14} /> + Agregar Usuario
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tenantUsers
                      .filter(u => u.tenantId === currentTenant.id)
                      .map(u => (
                        <div key={u.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-white">{u.name}</h4>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.role === 'admin' ? 'Admin' : 'Recepcionista'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: PERSONALIZACIÓN & BRANDING */}
            {configSubTab === 'branding' && (
              <div className="glass-card p-6 rounded-2xl space-y-6 border border-slate-800 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Palette size={16} className="text-indigo-400" /> Personalización & Marca de tu Negocio
                    </h3>
                    <p className="text-xs text-slate-400">Subí tus propias imágenes o elegí presets. Los cambios se guardan automáticamente en la nube.</p>
                  </div>
                </div>

                {/* LOGO SECCIÓN */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white">1. Logo / Foto de Perfil del Comercio</label>
                    <span className="text-[10px] text-slate-400">JPG, PNG o WEBP (Máx. 4MB)</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Preview Logo */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
                      {currentTenant.branding?.logoUrl ? (
                        /* eslint-disable-next-html-next-element */
                        <img
                          src={currentTenant.branding.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-black text-slate-500">Sin logo</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      {/* Botón de carga local */}
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer transition shadow-md flex items-center gap-1.5 shrink-0">
                          📁 Subir Mi Logo Propio
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('logoUrl', e)}
                            className="hidden"
                          />
                        </label>

                        {currentTenant.branding?.logoUrl && (
                          <button
                            type="button"
                            onClick={() => handleUpdateBranding('logoUrl', '')}
                            className="px-2.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition"
                          >
                            Quitar Logo
                          </button>
                        )}
                      </div>

                      {/* URL manual opcional */}
                      <input
                        type="text"
                        placeholder="O pegá la URL directa de la imagen (https://...)"
                        value={currentTenant.branding?.logoUrl || ''}
                        onChange={(e) => handleUpdateBranding('logoUrl', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 block pt-1">O elegí una imagen predeterminada:</span>
                  <div className="flex items-center gap-2">
                    {[
                      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150',
                      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150',
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=150'
                    ].map((url, idx) => (
                      /* eslint-disable-next-html-next-element */
                      <img
                        key={idx}
                        src={url}
                        alt="Preset logo"
                        onClick={() => handleUpdateBranding('logoUrl', url)}
                        className={`w-9 h-9 rounded-xl object-cover cursor-pointer border ${
                          currentTenant.branding?.logoUrl === url ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* BANNER SECCIÓN */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-white">2. Banner de Portada (Página de Reserva)</label>
                    <span className="text-[10px] text-slate-400">JPG, PNG o WEBP (Máx. 4MB)</span>
                  </div>

                  {/* Preview Banner */}
                  <div className="w-full h-24 rounded-2xl bg-slate-900 border-2 border-slate-700 overflow-hidden relative shadow-md">
                    {currentTenant.branding?.bannerUrl ? (
                      /* eslint-disable-next-html-next-element */
                      <img
                        src={currentTenant.branding.bannerUrl}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                        Sin banner asignado
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition shadow-md flex items-center justify-center gap-1.5 shrink-0">
                      🖼️ Subir Mi Banner Propio
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('bannerUrl', e)}
                        className="hidden"
                      />
                    </label>

                    {currentTenant.branding?.bannerUrl && (
                      <button
                        type="button"
                        onClick={() => handleUpdateBranding('bannerUrl', '')}
                        className="px-2.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition"
                      >
                        Quitar Banner
                      </button>
                    )}

                    <input
                      type="text"
                      placeholder="O pegá la URL directa del banner (https://...)"
                      value={currentTenant.branding?.bannerUrl || ''}
                      onChange={(e) => handleUpdateBranding('bannerUrl', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <span className="text-[10px] text-slate-400 block pt-1">Banners sugeridos por estilo:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '💈 Barbería', url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200' },
                      { label: '✨ Estética & Spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200' },
                      { label: '🧠 Psicología', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200' },
                      { label: '💇‍♀️ Peluquería Chic', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200' }
                    ].map((b, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUpdateBranding('bannerUrl', b.url)}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-left transition ${
                          currentTenant.branding?.bannerUrl === b.url ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Color Selector */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <label className="block text-xs font-bold text-white">3. Color Primario de la Marca</label>
                  <div className="flex items-center gap-3 pt-1">
                    {[
                      { name: 'Esmeralda', hex: '#10b981' },
                      { name: 'Índigo', hex: '#6366f1' },
                      { name: 'Rosa / Violeta', hex: '#ec4899' },
                      { name: 'Ámbar / Dorado', hex: '#f59e0b' },
                      { name: 'Cian / Turquesa', hex: '#06b6d4' },
                      { name: 'Rojo Carmesí', hex: '#f43f5e' }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => handleUpdateBranding('primaryColor', c.hex)}
                        className={`w-9 h-9 rounded-full transition shadow-md flex items-center justify-center border-2 ${
                          (currentTenant.branding?.primaryColor || '#10b981') === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {(currentTenant.branding?.primaryColor || '#10b981') === c.hex && <Check size={16} className="text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 3: SERVICIOS & PRECIOS + EQUIPO DE PROFESIONALES */}
            {configSubTab === 'services' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Services */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Briefcase size={16} className="text-amber-400" /> Servicios & Precios ({tenantServices.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setNewServiceName('');
                        setNewServiceDuration(30);
                        setNewServicePrice(10000);
                        setIsAddServiceOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition"
                    >
                      + Agregar Servicio
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tenantServices.map(s => (
                      <div key={s.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{s.name}</h4>
                          <p className="text-xs text-slate-400">⏱️ {s.durationMinutes} min</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-amber-400">${s.price.toLocaleString('es-AR')}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(s.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition border border-rose-500/20"
                            title="Eliminar servicio"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Professionals */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users size={16} className="text-indigo-400" /> Equipo de Profesionales ({tenantProfessionals.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfessional(null);
                        setProfName('');
                        setProfSpecialty('');
                        setProfAvatarUrl('');
                        setIsProfessionalModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
                    >
                      + Agregar Profesional
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tenantProfessionals.map(p => (
                      <div key={p.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-html-next-element */}
                          <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-white">{p.name}</h4>
                            <p className="text-xs text-slate-400">{p.specialty}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProfessional(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProfessional(p.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition border border-rose-500/20"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: DÍAS & HORARIOS */}
            {configSubTab === 'horarios' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock size={16} className="text-indigo-400" /> Horarios Disponibles del Negocio
                    </h3>
                    <p className="text-xs text-slate-400">Configurá los días y rangos de atención para las reservas web</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Intervalo:</span>
                    <select
                      value={currentTenant.slotIntervalMinutes || 30}
                      onChange={(e) => handleUpdateInterval(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value={15}>Cada 15 min</option>
                      <option value={30}>Cada 30 min</option>
                      <option value={45}>Cada 45 min</option>
                      <option value={60}>Cada 60 min</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeSchedule.map((dayItem, idx) => (
                    <div key={dayItem.day} className="glass-card p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={dayItem.isOpen}
                            onChange={(e) => handleUpdateScheduleDay(idx, 'isOpen', e.target.checked)}
                            className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                          />
                          <span className={`text-sm font-bold ${dayItem.isOpen ? 'text-white' : 'text-slate-500'}`}>
                            {dayItem.day}
                          </span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          dayItem.isOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {dayItem.isOpen ? 'Abierto' : 'Cerrado'}
                        </span>
                      </div>

                      {dayItem.isOpen && (
                        <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">De:</span>
                            <input
                              type="time"
                              value={dayItem.openTime}
                              onChange={(e) => handleUpdateScheduleDay(idx, 'openTime', e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                            />
                            <span className="text-slate-400">a:</span>
                            <input
                              type="time"
                              value={dayItem.closeTime}
                              onChange={(e) => handleUpdateScheduleDay(idx, 'closeTime', e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 5: WHATSAPP & AVISOS */}
            {configSubTab === 'whatsapp' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare size={16} className="text-emerald-400" /> Configuración de WhatsApp del Negocio
                      </h3>
                      <p className="text-xs text-slate-400">Instancia vinculada para enviar notificaciones automáticas</p>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      currentTenant.whatsappConfig.status === 'connected' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {currentTenant.whatsappConfig.status === 'connected' ? '● Conectado' : '⏳ Pendiente QR'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      {/* eslint-disable-next-html-next-element */}
                      <img
                        src={currentTenant.whatsappConfig.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAAS_TENANT_QR_${currentTenant.slug}`}
                        alt="WhatsApp QR Code"
                        className="w-40 h-40 bg-white p-2 rounded-xl shadow-md"
                      />
                      <span className="text-xs text-slate-400 text-center">
                        Escaneá este código desde WhatsApp ➔ Dispositivos Vinculados
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="space-y-2">
                        <span className="font-bold text-white block">Recordatorios Automáticos:</span>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={currentTenant.whatsappConfig.autoRemind24h}
                            onChange={(e) => handleUpdateWhatsappConfig('autoRemind24h', e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 rounded"
                          />
                          <span>Enviar recordatorio 24 horas antes del turno</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={currentTenant.whatsappConfig.autoRemind2h}
                            onChange={(e) => handleUpdateWhatsappConfig('autoRemind2h', e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 rounded"
                          />
                          <span>Enviar aviso exprés 2 horas antes</span>
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-white block">Mensaje de Bienvenida Automático</label>
                        <textarea
                          rows={2}
                          value={currentTenant.whatsappConfig.welcomeMessage}
                          onChange={(e) => handleUpdateWhatsappConfig('welcomeMessage', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 6: MI PERFIL DE USUARIO */}
            {configSubTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <form onSubmit={handleSaveUserProfile} className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserIcon size={16} className="text-indigo-400" /> Perfil de Usuario Logueado (Tus Datos)
                    </h3>
                    {profileSaveMsg && (
                      <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        {profileSaveMsg}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Nombre del Titular / Usuario</label>
                      <input
                        type="text"
                        value={userProfileName}
                        onChange={(e) => setUserProfileName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Email Registrado (Acceso)</label>
                      <input
                        type="email"
                        disabled
                        value={currentTenant.ownerEmail}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Lock size={14} /> Cambiar / Resetear Contraseña
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition"
                    >
                      Actualizar Perfil
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: CLIENTES & HISTORIAL */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-teal-400" /> Cartera de Clientes / Pacientes ({tenantClients.length})
            </h2>

            <div className="space-y-3">
              {tenantClients.map(c => (
                <div key={c.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <p className="text-xs text-slate-400">📱 {c.phone}</p>
                    {c.notes && <p className="text-xs text-slate-300 mt-1">📝 {c.notes}</p>}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-400 block">{c.totalAppointments} turnos</span>
                    <span className="text-[10px] text-slate-400">Cliente activo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar - 4 Pestañas Principales */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg z-40 px-2 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${
              activeTab === 'dashboard' ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 size={18} />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition relative ${
              activeTab === 'agenda' ? 'text-indigo-400 bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Calendar size={18} />
              {todayAppsCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-indigo-500 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-slate-900 shadow-sm">
                  {todayAppsCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${
              activeTab === 'clientes' ? 'text-teal-400 bg-teal-500/10 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={18} />
            <span className="text-[10px]">Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('configuracion')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${
              activeTab === 'configuracion' ? 'text-indigo-400 bg-indigo-500/10 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={18} />
            <span className="text-[10px]">Config.</span>
          </button>

        </div>
      </nav>

      {/* Modal: Nuevo Turno Manual */}
      {isAddAppointmentOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle size={18} className="text-indigo-400" /> Agendar Nuevo Turno
              </h3>
              <button onClick={() => setIsAddAppointmentOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Matías López"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 5544-3322"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Servicio</label>
                  <select
                    required
                    value={newServiceId}
                    onChange={(e) => setNewServiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="">Elegir...</option>
                    {tenantServices.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Profesional</label>
                  <select
                    required
                    value={newProfessionalId}
                    onChange={(e) => setNewProfessionalId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="">Elegir...</option>
                    {tenantProfessionals.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hora</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas privadas</label>
                <input
                  type="text"
                  placeholder="Detalles especiales..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddAppointmentOpen(false)} className="text-xs text-slate-400 px-3 py-1.5">Cancelar</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">Guardar Turno</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Servicio */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Agregar Nuevo Servicio</h3>
              <button onClick={() => setIsAddServiceOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Servicio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Corte + Peinado, Sesión Facial"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio (AR$)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddServiceOpen(false)} className="text-xs text-slate-400 px-3 py-1.5">Cancelar</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">Crear Servicio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Profesional */}
      {isProfessionalModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                {editingProfessional ? 'Editar Profesional' : 'Agregar Nuevo Profesional'}
              </h3>
              <button 
                onClick={() => {
                  setIsProfessionalModalOpen(false);
                  setEditingProfessional(null);
                }} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfessional} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Franco Stylist, Dr. Martín Rossi"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Especialidad / Rol *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Barbero Senior, Cosmiatra, Terapia Cognitiva"
                  value={profSpecialty}
                  onChange={(e) => setProfSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Foto / Avatar (URL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={profAvatarUrl}
                  onChange={(e) => setProfAvatarUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 mb-2"
                />

                {/* Presets */}
                <span className="text-[10px] text-slate-400 block mb-1">O elegí una foto rápida:</span>
                <div className="flex items-center gap-2">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
                  ].map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset avatar"
                      onClick={() => setProfAvatarUrl(url)}
                      className={`w-9 h-9 rounded-xl object-cover cursor-pointer border ${
                        profAvatarUrl === url ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsProfessionalModalOpen(false);
                    setEditingProfessional(null);
                  }} 
                  className="text-xs text-slate-400 px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md">
                  {editingProfessional ? 'Guardar Cambios' : 'Crear Profesional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dar Acceso a Nuevo Usuario */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-emerald-400" />
                Dar Acceso a Nuevo Colaborador
              </h3>
              <button 
                onClick={() => setIsAddUserModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTenantUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia Recepción, Gabriel Barbero"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email de Acceso *</label>
                <input
                  type="email"
                  required
                  placeholder="sofia@tucomercio.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rol / Permisos</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'receptionist')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="receptionist">Recepcionista / Ver Agenda y Turnos</option>
                  <option value="admin">Administrador del Negocio</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">ℹ️ Instrucciones para el nuevo usuario:</span>
                <p>El colaborador podrá ingresar en <strong>/login</strong> seleccionando "Acceso Empresa" con este email.</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddUserModalOpen(false)} 
                  className="text-xs text-slate-400 px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md">
                  Otorgar Acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cambiar / Resetear Contraseña */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-indigo-400" />
                Cambiar Contraseña de Cuenta
              </h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3">
              {passwordErrorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              {passwordSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check size={16} className="shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nueva Contraseña (mínimo 6 caracteres)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="text-xs text-slate-400 px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md">
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Onboarding Wizard Inicial de Negocio */}
      {currentTenant.hasCompletedOnboarding === false && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            
            {/* Header Wizard con botón Omitir Todo */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
                  <Rocket size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight">
                    ¡Bienvenido a tuturnito<span className="text-emerald-400">.app</span>! 🚀
                  </h3>
                  <p className="text-[11px] text-slate-400">Configuración inicial del negocio</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-full">
                  {onboardingStep} de 5
                </span>
                <button
                  onClick={handleCompleteOnboarding}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 underline font-medium"
                >
                  Omitir Todo ➔
                </button>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5">
              <div className={`h-1.5 rounded-full transition ${onboardingStep >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full transition ${onboardingStep >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full transition ${onboardingStep >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full transition ${onboardingStep >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full transition ${onboardingStep >= 5 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
            </div>

            {/* STEP 1: Datos & Identidad */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building size={16} className="text-emerald-400" /> 1. Datos e Identidad del Comercio
                  </h4>
                  <p className="text-xs text-slate-400">Personalizá cómo te verán tus clientes al ingresar a agendar turnos</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 mb-1 block">Nombre del Negocio</label>
                    <input
                      type="text"
                      value={currentTenant.name}
                      onChange={(e) => {
                        const updated = { ...currentTenant, name: e.target.value };
                        setCurrentTenant(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 mb-1 block">Preset de Logo del Comercio</label>
                    <div className="flex items-center gap-2 pt-1">
                      {[
                        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150',
                        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=150',
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=150'
                      ].map((url, idx) => (
                        /* eslint-disable-next-html-next-element */
                        <img
                          key={idx}
                          src={url}
                          alt="Preset logo"
                          onClick={() => handleUpdateBranding('logoUrl', url)}
                          className={`w-10 h-10 rounded-xl object-cover cursor-pointer border ${
                            currentTenant.branding?.logoUrl === url ? 'border-emerald-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Omitir este paso
                  </button>
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    Siguiente: Servicios & Precios →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Configuración de Servicios & Precios */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Scissors size={16} className="text-emerald-400" /> 2. Servicios & Precios Iniciales
                  </h4>
                  <p className="text-xs text-slate-400">Agregá tus principales servicios o modificá los predeterminados</p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 block">Agregar Nuevo Servicio Rápidamente:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nombre servicio"
                        value={obServiceName}
                        onChange={(e) => setObServiceName(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Precio $"
                        value={obServicePrice}
                        onChange={(e) => setObServicePrice(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!obServiceName) return;
                          const newS: Service = {
                            id: `s-${Date.now()}`,
                            tenantId: currentTenant.id,
                            name: obServiceName,
                            durationMinutes: parseInt(obServiceDuration) || 30,
                            price: parseFloat(obServicePrice) || 0,
                            category: 'General',
                            requireDeposit: false
                          };
                          setServices([newS, ...services]);
                          setObServiceName('');
                          setObServicePrice('');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl py-1.5"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {tenantServices.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-2">No hay servicios aún.</p>
                    ) : (
                      tenantServices.map(s => (
                        <div key={s.id} className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800/80 text-xs">
                          <span className="font-semibold text-white truncate max-w-[180px]">{s.name}</span>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-slate-400">{s.durationMinutes} min</span>
                            <span className="font-bold text-emerald-400">${s.price.toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Omitir este paso
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="text-xs text-slate-400 hover:text-white px-2"
                    >
                      ← Atrás
                    </button>
                    <button
                      onClick={() => setOnboardingStep(3)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Siguiente: Horarios →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Configuración de Días & Horarios de Atención */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-emerald-400" /> 3. Días & Intervalo de Atención
                  </h4>
                  <p className="text-xs text-slate-400">Definí el tiempo de cada turno y tus días laborales</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-300 mb-1 block">Intervalo por Turno (minutos)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            const updated = { ...currentTenant, slotIntervalMinutes: mins };
                            setCurrentTenant(updated);
                          }}
                          className={`py-2 rounded-xl border text-xs font-bold transition ${
                            currentTenant.slotIntervalMinutes === mins
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-slate-300 block">Jornada habitual de Atención:</span>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>Lunes a Sábado</span>
                      <span className="font-bold text-white">09:00 a 19:00 hs</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Omitir este paso
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="text-xs text-slate-400 hover:text-white px-2"
                    >
                      ← Atrás
                    </button>
                    <button
                      onClick={() => setOnboardingStep(4)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Siguiente: WhatsApp →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Vinculación WhatsApp */}
            {onboardingStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-400" /> 4. Conectá tu WhatsApp para Recordatorios
                  </h4>
                  <p className="text-xs text-slate-400">Escaneá el código QR desde tu celular en WhatsApp ➔ Dispositivos Vinculados</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
                  {/* eslint-disable-next-html-next-element */}
                  <img
                    src={currentTenant.whatsappConfig.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAAS_TENANT_QR_${currentTenant.slug}`}
                    alt="WhatsApp QR Code"
                    className="w-32 h-32 bg-white p-2 rounded-xl shadow-md"
                  />
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check size={14} /> Instancia lista para escanear
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setOnboardingStep(5)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Omitir / Configurar después
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOnboardingStep(3)}
                      className="text-xs text-slate-400 hover:text-white px-2"
                    >
                      ← Atrás
                    </button>
                    <button
                      onClick={() => setOnboardingStep(5)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                    >
                      Siguiente: Confirmación →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Listo para empezar */}
            {onboardingStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Check size={16} className="text-emerald-400" /> 5. ¡Tu negocio está listo para recibir turnos!
                  </h4>
                  <p className="text-xs text-slate-400">Tus clientes ya pueden agendar mediante tu link personalizado</p>
                </div>

                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-indigo-300 block">🌐 Tu URL de Reserva Directa:</span>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-300 font-mono flex-1 truncate">
                      tuturnito.app/reserva/{currentTenant.slug}
                    </span>
                    <button
                      onClick={handleCopyBookingLink}
                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30"
                    >
                      {copiedLink ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Atrás
                  </button>
                  <button
                    onClick={handleCompleteOnboarding}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xl transition transform hover:scale-105"
                  >
                    ¡Comenzar a usar mi Dashboard! 🚀
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function TenantAdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <p className="text-sm text-slate-400">Cargando Panel de Negocio...</p>
      </div>
    }>
      <TenantAdminContent />
    </Suspense>
  );
}

