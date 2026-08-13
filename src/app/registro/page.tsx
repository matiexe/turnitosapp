'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CalendarCheck, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Scissors, 
  Sparkles, 
  Brain, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkle
} from 'lucide-react';
import { Tenant, RubroType } from '@/types/saas';
import { INITIAL_TENANTS, DEFAULT_SCHEDULE } from '@/lib/mockStore';

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [rubro, setRubro] = useState<RubroType>('peluqueria');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName || !ownerEmail) return;

    setIsSubmitting(true);

    const slug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newTenant: Tenant = {
      id: `t-${Date.now()}`,
      name: businessName,
      slug: slug || `negocio-${Date.now()}`,
      rubro,
      ownerName,
      ownerEmail,
      phone: phone || '+54 9 11 0000-0000',
      plan: 'trial',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      slotIntervalMinutes: 30,
      schedule: DEFAULT_SCHEDULE,
      whatsappConfig: {
        instanceId: `inst_${slug}`,
        status: 'qrcode_ready',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SAAS_TENANT_QR_${slug}`,
        autoRemind24h: true,
        autoRemind2h: true,
        welcomeMessage: `¡Hola! Bienvenido a ${businessName}. ¿Qué turno querés agendar hoy?`
      }
    };

    // Save to localStorage
    const savedTenants = localStorage.getItem('saas_tenants');
    const existingTenants: Tenant[] = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;
    const updatedTenants = [newTenant, ...existingTenants];
    localStorage.setItem('saas_tenants', JSON.stringify(updatedTenants));

    // Also store active user session
    localStorage.setItem('tuturnito_current_user', JSON.stringify({
      email: ownerEmail,
      tenantId: newTenant.id,
      role: 'tenant_admin'
    }));

    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to tenant admin panel
      router.push(`/admin?tenant=${newTenant.id}`);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Header */}
      <header className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-xl text-white shadow-lg">
              <CalendarCheck size={20} />
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              tuturnito<span className="text-emerald-400">.app</span>
            </span>
          </Link>

          <div className="text-xs text-slate-400">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="glass-card max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          
          {/* Badge & Title */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
              <Zap size={14} className="text-amber-400" /> 14 Días Gratis • Sin Tarjeta
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Creá la cuenta para tu negocio
            </h1>
            <p className="text-xs text-slate-400">
              Automatizá tus turnos por WhatsApp en menos de 3 minutos
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de tu Negocio / Barbería / Consultorio *</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Barbería El Imperio, Estética Bella, etc."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Rubro Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rubro Principal</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRubro('peluqueria')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    rubro === 'peluqueria'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Scissors size={18} className={rubro === 'peluqueria' ? 'text-amber-400' : 'text-slate-500'} />
                  <span className="text-[11px] font-bold mt-2 block">Peluquería / Barbería</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRubro('estetica')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    rubro === 'estetica'
                      ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles size={18} className={rubro === 'estetica' ? 'text-pink-400' : 'text-slate-500'} />
                  <span className="text-[11px] font-bold mt-2 block">Estética & Belleza</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRubro('psicologia')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    rubro === 'psicologia'
                      ? 'bg-teal-500/10 border-teal-500 text-teal-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Brain size={18} className={rubro === 'psicologia' ? 'text-teal-400' : 'text-slate-500'} />
                  <span className="text-[11px] font-bold mt-2 block">Psicología / Salud</span>
                </button>
              </div>
            </div>

            {/* Owner Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre Completo *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcos Benítez"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp del Negocio *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="+54 9 11 1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email de Acceso *</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="contacto@tunegocio.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-2xl transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? 'Creando tu Espacio...' : 'Comenzar Prueba Gratuita de 14 Días 🚀'}
            </button>

          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            Al registrarte aceptas las condiciones de servicio de tuturnito.app.
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 tuturnito.app — Registro de Cuentas para Negocios.
      </footer>

    </div>
  );
}
