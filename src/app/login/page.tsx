'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CalendarCheck, 
  Mail, 
  Lock, 
  ArrowRight,
  Building2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBusinessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Credenciales de acceso no válidas.');
        return;
      }

      // Store active user session
      localStorage.setItem('tuturnito_current_user', JSON.stringify({
        email: data.user.email,
        tenantId: data.tenant.id,
        role: 'tenant_admin'
      }));

      // Redirect to the business admin page
      router.push(`/admin?tenant=${data.tenant.id}`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Error de conexión con el servidor.');
    }
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
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Building2 size={24} />
            </div>
            <h1 className="text-xl font-black text-white">
              Acceso Empresa / Negocio
            </h1>
            <p className="text-xs text-slate-400">
              Ingresá a tu panel para gestionar turnos, agenda, servicios y WhatsApp
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleBusinessLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email de Acceso *</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="marcos@barberclub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <>
                  <span>Ingresar a mi Negocio</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Super Admin Endpoint Link */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link 
              href="/superadmin/login" 
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 transition"
            >
              <ShieldAlert size={13} /> Acceso Administrador Máster (Super Admin)
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/60 text-center text-xs text-slate-400">
        tuturnito.app © 2026 — Plataforma de Gestión de Turnos SaaS
      </footer>
    </div>
  );
}
