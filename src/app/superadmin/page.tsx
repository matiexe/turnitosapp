'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  TrendingUp, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  QrCode, 
  Layers,
  Scissors,
  Sparkles,
  Brain,
  ArrowRight,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { Tenant, RubroType, SuperAdminStats, WhatsAppStatus, Appointment, Client } from '@/types/saas';
import { INITIAL_TENANTS, INITIAL_APPOINTMENTS, INITIAL_CLIENTS, getInitialSuperAdminStats, DEFAULT_SCHEDULE } from '@/lib/mockStore';

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubro, setSelectedRubro] = useState<RubroType | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTenantForQR, setSelectedTenantForQR] = useState<Tenant | null>(null);

  // New Tenant Form State
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantRubro, setNewTenantRubro] = useState<RubroType>('peluqueria');
  const [newTenantOwner, setNewTenantOwner] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'trial' | 'pro' | 'enterprise'>('pro');

  const [isLoading, setIsLoading] = useState(true);

  const fetchRealData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Real Tenants from Database
      const resTenants = await fetch('/api/tenants');
      const dataTenants = await resTenants.json();

      // 2. Fetch Real Appointments from Database
      const resApps = await fetch('/api/appointments');
      const dataApps = await resApps.json();

      let realTenants: Tenant[] = [];
      let realApps: Appointment[] = [];

      if (dataTenants.success && dataTenants.tenants && dataTenants.tenants.length > 0) {
        realTenants = dataTenants.tenants;
      } else {
        const savedTenants = localStorage.getItem('saas_tenants');
        realTenants = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;
      }

      if (dataApps.success && dataApps.appointments) {
        realApps = dataApps.appointments;
      } else {
        const savedApps = localStorage.getItem('saas_appointments');
        realApps = savedApps ? JSON.parse(savedApps) : INITIAL_APPOINTMENTS;
      }

      setTenants(realTenants);
      localStorage.setItem('saas_tenants', JSON.stringify(realTenants));

      // Compute Real Stats
      const totalTenants = realTenants.length;
      const activeTenants = realTenants.filter(t => t.status === 'active').length;
      const totalAppointmentsCount = realApps.length;
      const connectedWhatsapp = realTenants.filter(t => t.whatsappConfig?.status === 'connected').length;
      const connectedWhatsappRatio = totalTenants > 0 ? Math.round((connectedWhatsapp / totalTenants) * 100) : 0;
      
      let monthlyRevenue = 0;
      realTenants.forEach(t => {
        if (t.plan === 'pro') monthlyRevenue += 15000;
        if (t.plan === 'enterprise') monthlyRevenue += 35000;
      });

      setStats({
        totalTenants,
        activeTenants,
        totalUsersCount: realTenants.length * 5,
        totalAppointmentsCount,
        connectedWhatsappRatio,
        monthlyRevenue
      });
    } catch (err) {
      console.error('Error fetching real data for SuperAdmin:', err);
      const savedTenants = localStorage.getItem('saas_tenants');
      const parsedTenants = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;
      setTenants(parsedTenants);
      setStats(getInitialSuperAdminStats(parsedTenants, INITIAL_APPOINTMENTS, INITIAL_CLIENTS));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const saveTenantsToStore = (updated: Tenant[]) => {
    setTenants(updated);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));
    const totalTenants = updated.length;
    const activeTenants = updated.filter(t => t.status === 'active').length;
    const connectedWhatsapp = updated.filter(t => t.whatsappConfig?.status === 'connected').length;
    const connectedWhatsappRatio = totalTenants > 0 ? Math.round((connectedWhatsapp / totalTenants) * 100) : 0;
    let monthlyRevenue = 0;
    updated.forEach(t => {
      if (t.plan === 'pro') monthlyRevenue += 15000;
      if (t.plan === 'enterprise') monthlyRevenue += 35000;
    });
    setStats({
      totalTenants,
      activeTenants,
      totalUsersCount: updated.length * 5,
      totalAppointmentsCount: stats?.totalAppointmentsCount || 0,
      connectedWhatsappRatio,
      monthlyRevenue
    });
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantOwner || !newTenantEmail) return;

    const slug = newTenantSlug || newTenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTenantName,
          slug,
          rubro: newTenantRubro,
          ownerName: newTenantOwner,
          ownerEmail: newTenantEmail,
          phone: newTenantPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRealData();
      } else {
        alert(data.error || 'Error al crear el comercio.');
      }
    } catch (e) {
      console.error('Error creating tenant:', e);
    }

    // Reset Form
    setNewTenantName('');
    setNewTenantSlug('');
    setNewTenantOwner('');
    setNewTenantEmail('');
    setNewTenantPhone('');
    setIsCreateModalOpen(false);
  };

  const toggleTenantStatus = (id: string) => {
    const updated: Tenant[] = tenants.map(t => {
      if (t.id === id) {
        const nextStatus: 'active' | 'suspended' = t.status === 'active' ? 'suspended' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveTenantsToStore(updated);
  };

  const toggleWhatsAppConnect = (id: string) => {
    const updated: Tenant[] = tenants.map(t => {
      if (t.id === id) {
        const nextStatus: WhatsAppStatus = t.whatsappConfig.status === 'connected' ? 'disconnected' : 'connected';
        return {
          ...t,
          whatsappConfig: {
            ...t.whatsappConfig,
            status: nextStatus,
            phoneNumber: nextStatus === 'connected' ? (t.phone || '+54 9 11 9999-8888') : undefined
          }
        };
      }
      return t;
    });
    saveTenantsToStore(updated);
    if (selectedTenantForQR?.id === id) {
      setSelectedTenantForQR(null);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRubro = selectedRubro === 'all' || t.rubro === selectedRubro;
    return matchesSearch && matchesRubro;
  });

  const getRubroBadge = (rubro: RubroType) => {
    switch (rubro) {
      case 'peluqueria':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Scissors size={12} /> Peluquería</span>;
      case 'estetica':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20"><Sparkles size={12} /> Estética</span>;
      case 'psicologia':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20"><Brain size={12} /> Psicología</span>;
    }
  };

  const getWhatsAppBadge = (status: Tenant['whatsappConfig']['status']) => {
    switch (status) {
      case 'connected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Conectado</span>;
      case 'qrcode_ready':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"><QrCode size={12} /> Escanear QR</span>;
      case 'disconnected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30"><XCircle size={12} /> Desconectado</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Plataforma Master SaaS</h1>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-semibold rounded-md border border-indigo-500/20">Super Admin</span>
            </div>
            <p className="text-xs text-slate-400">Control global de empresas, usuarios y bots de WhatsApp</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/admin" 
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700"
          >
            <Smartphone size={15} /> Panel Negocio Demo
          </Link>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-md shadow-indigo-600/30"
          >
            <PlusCircle size={16} /> Alta Nueva Empresa
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Negocios Registrados</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Building2 size={20} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{stats?.totalTenants || 0}</span>
              <span className="ml-2 text-xs text-emerald-400 font-medium">({stats?.activeTenants || 0} activos)</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Empresas en la plataforma</p>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Usuarios Atendidos</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{stats?.totalUsersCount || 0}</span>
              <span className="ml-2 text-xs text-emerald-400 font-medium">+18% este mes</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Clientes finales agendados</p>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Turnos Procesados</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <CalendarCheck size={20} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{stats?.totalAppointmentsCount || 0}</span>
              <span className="ml-2 text-xs text-purple-400 font-medium">Acumulados</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">En peluquerías, estéticas y psicólogos</p>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">WhatsApp Conectados</span>
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{stats?.connectedWhatsappRatio || 0}%</span>
              <span className="ml-2 text-xs text-teal-400 font-medium">Tasa de QR</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Instancias de WhatsApp activas</p>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por negocio, dueño o slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter size={14} /> Rubro:
            </span>

            <button
              onClick={() => setSelectedRubro('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedRubro === 'all' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos ({tenants.length})
            </button>

            <button
              onClick={() => setSelectedRubro('peluqueria')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                selectedRubro === 'peluqueria' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Scissors size={14} /> Peluquerías
            </button>

            <button
              onClick={() => setSelectedRubro('estetica')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                selectedRubro === 'estetica' 
                  ? 'bg-pink-600 text-white shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles size={14} /> Estéticas
            </button>

            <button
              onClick={() => setSelectedRubro('psicologia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                selectedRubro === 'psicologia' 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Brain size={14} /> Psicólogos
            </button>
          </div>

        </div>

        {/* Tenant Cards Table / Grid */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-indigo-400" />
              Listado de Empresas Registradas
            </h2>
            <span className="text-xs text-slate-400">{filteredTenants.length} resultados</span>
          </div>

          <div className="divide-y divide-slate-800">
            {filteredTenants.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Building2 size={40} className="mx-auto mb-3 text-slate-600 opacity-60" />
                <p className="text-sm font-medium">No se encontraron empresas con los filtros aplicados.</p>
              </div>
            ) : (
              filteredTenants.map((t) => (
                <div key={t.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-900/60 transition">
                  
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-black text-indigo-400 shrink-0 shadow-inner">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">{t.name}</h3>
                        {getRubroBadge(t.rubro)}
                        {getWhatsAppBadge(t.whatsappConfig.status)}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 flex-wrap">
                        <span>👤 <strong>{t.ownerName}</strong> ({t.ownerEmail})</span>
                        <span>📱 {t.phone}</span>
                        <span>Plan: <strong className="text-slate-200 uppercase">{t.plan}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                    
                    {/* QR Config Button */}
                    <button
                      onClick={() => setSelectedTenantForQR(t)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 flex items-center gap-1.5"
                      title="Ver estado de conexión WhatsApp"
                    >
                      <QrCode size={14} className="text-emerald-400" /> WhatsApp QR
                    </button>

                    {/* Client Booking Webview Preview */}
                    <Link
                      href={`/reserva/${t.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} className="text-indigo-400" /> Ver Reserva Client
                    </Link>

                    {/* Impersonate / Enter Tenant Admin Panel */}
                    <Link
                      href={`/admin?tenant=${t.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm flex items-center gap-1.5"
                    >
                      <Smartphone size={14} /> Entrar a Panel
                    </Link>

                    {/* Toggle Active / Suspended */}
                    <button
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                        t.status === 'active' 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                      title={t.status === 'active' ? 'Suspender empresa' : 'Activar empresa'}
                    >
                      {t.status === 'active' ? 'Suspender' : 'Activar'}
                    </button>

                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Modal: Alta Nueva Empresa */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-indigo-400" /> Alta de Nueva Empresa (Tenant)
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de la Empresa / Negocio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Barbería El Imperio, Estética Bella, etc."
                  value={newTenantName}
                  onChange={(e) => {
                    setNewTenantName(e.target.value);
                    setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rubro Principal</label>
                  <select
                    value={newTenantRubro}
                    onChange={(e) => setNewTenantRubro(e.target.value as RubroType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="peluqueria">💇 Peluquería / Barbería</option>
                    <option value="estetica">💅 Estética & Belleza</option>
                    <option value="psicologia">🧠 Psicología / Salud</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Contratado</label>
                  <select
                    value={newTenantPlan}
                    onChange={(e) => setNewTenantPlan(e.target.value as 'trial' | 'pro' | 'enterprise')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="trial">Prueba Gratuita (14 días)</option>
                    <option value="pro">Plan Pro (Multiprofesional)</option>
                    <option value="enterprise">Plan Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Dueño / Responsable</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez"
                  value={newTenantOwner}
                  onChange={(e) => setNewTenantOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    required
                    placeholder="laura@negocio.com"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp del Negocio</label>
                  <input
                    type="text"
                    placeholder="+54 9 11 1234-5678"
                    value={newTenantPhone}
                    onChange={(e) => setNewTenantPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition"
                >
                  Crear y Generar Instancia WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configuración de WhatsApp / QR */}
      {selectedTenantForQR && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
              <div>
                <h3 className="text-base font-bold text-white">{selectedTenantForQR.name}</h3>
                <p className="text-xs text-slate-400">Instancia: {selectedTenantForQR.whatsappConfig.instanceId}</p>
              </div>
              <button 
                onClick={() => setSelectedTenantForQR(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="py-2">
              <p className="text-xs text-slate-300 mb-3">
                Escaneá este código QR desde el WhatsApp de la empresa (Dispositivos vinculados) para activar la automatización de turnos:
              </p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto border border-slate-200">
                {/* Simulated QR Code image */}
                {/* eslint-disable-next-html-next-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SAAS_TENANT_QR_${selectedTenantForQR.slug}`}
                  alt="Código QR WhatsApp"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="mt-4">
                {getWhatsAppBadge(selectedTenantForQR.whatsappConfig.status)}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => toggleWhatsAppConnect(selectedTenantForQR.id)}
                className="w-full py-2 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-md"
              >
                {selectedTenantForQR.whatsappConfig.status === 'connected' ? 'Simular Desconexión' : 'Simular QR Escaneado con Éxito'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
