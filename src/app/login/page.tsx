'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CalendarCheck, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  ArrowRight,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Tenant, TenantUser } from '@/types/saas';
import { INITIAL_TENANTS, INITIAL_TENANT_USERS } from '@/lib/mockStore';

export default function LoginPage() {
  const router = useRouter();

  const [roleMode, setRoleMode] = useState<'business' | 'superadmin'>('business');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (roleMode === 'superadmin') {
        // Direct redirect to Super Admin Dashboard
        localStorage.setItem('tuturnito_current_user', JSON.stringify({
          email: email || 'admin@tuturnito.app',
          role: 'superadmin'
        }));
        router.push('/superadmin');
        return;
      }

      // Business Login Validation
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        setErrorMsg('Por favor ingresá tu correo electrónico.');
        return;
      }

      const savedTenants = localStorage.getItem('saas_tenants');
      const tenantsList: Tenant[] = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;

      // 1. Search by Tenant Owner Email
      let foundTenant = tenantsList.find(t => t.ownerEmail.toLowerCase() === cleanEmail);

      // 2. If not found as owner, search by Tenant User (collaborator/receptionist)
      if (!foundTenant) {
        const savedTenantUsers = localStorage.getItem('saas_tenant_users');
        const tenantUsersList: TenantUser[] = savedTenantUsers ? JSON.parse(savedTenantUsers) : INITIAL_TENANT_USERS;
        const matchedUser = tenantUsersList.find(u => u.email.toLowerCase() === cleanEmail);
        if (matchedUser) {
          foundTenant = tenantsList.find(t => t.id === matchedUser.tenantId);
        }
      }

      // 3. If account is not found, stop and display error (NEVER default to demo tenant!)
      if (!foundTenant) {
        setErrorMsg('No encontramos un negocio o usuario registrado con este email. Verificá los datos o registrá tu comercio.');
        return;
      }

      // Store active user session
      localStorage.setItem('tuturnito_current_user', JSON.stringify({
        email: cleanEmail,
        tenantId: foundTenant.id,
        role: 'tenant_admin'
      }));

      // Redirect to the SPECIFIC business admin page
      router.push(`/admin?tenant=${foundTenant.id}`);
    }, 400);
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
            ¿No tenés cuenta aún?{' '}
            <Link href="/registro" className="text-emerald-400 font-bold hover:underline">
              Registrar Negocio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="glass-card max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Role Mode Switcher Pills */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setRoleMode('business')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                roleMode === 'business'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 size={15} /> Acceso Empresa
            </button>

            <button
              type="button"
              onClick={() => setRoleMode('superadmin')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                roleMode === 'superadmin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={15} /> Super Admin
            </button>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-white">
              {roleMode === 'business' ? 'Ingresá al Panel de tu Negocio' : 'Ingreso al Dashboard Máster'}
            </h1>
            <p className="text-xs text-slate-400">
              {roleMode === 'business' 
                ? 'Gestioná tus turnos, horarios y WhatsApp' 
                : 'Control global de comercios registrados y métricas'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email de Acceso</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder={roleMode === 'business' ? 'laura@negocio.com' : 'admin@tuturnito.app'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
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

            {errorMsg && (
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 text-xs font-extrabold text-white rounded-2xl transition shadow-lg flex items-center justify-center gap-2 ${
                roleMode === 'business'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isLoading ? 'Ingresando...' : roleMode === 'business' ? 'Entrar a mi Panel Negocio 🚀' : 'Entrar a Plataforma Máster 👑'}
            </button>

          </form>

          {roleMode === 'business' && (
            <div className="pt-2 text-center text-xs text-slate-400">
              ¿Sos cliente y querés agendar un turno? <br />
              <span className="text-slate-500 text-[11px]">Solicitá el link de reserva directo a tu barbería o estética.</span>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        © 2026 tuturnito.app — Acceso a la Plataforma.
      </footer>

    </div>
  );
}
