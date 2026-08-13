'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  MessageSquare, 
  Scissors, 
  Sparkles, 
  Brain, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Smartphone, 
  Zap, 
  Star, 
  Clock, 
  TrendingUp, 
  Shield, 
  HelpCircle,
  Play,
  ChevronDown,
  CheckCircle,
  Flame,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Banner Offer */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 px-4 py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-2">
        <Flame size={14} className="text-amber-300 animate-bounce" />
        <span>¡Lanzamiento Especial! Probá <strong>tuturnito.app</strong> gratis por 14 días sin ingresar tarjeta de crédito.</span>
      </div>

      {/* Main Header / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <CalendarCheck size={22} />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none">
                tuturnito<span className="text-emerald-400">.app</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Gestión de turnos inteligente</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#beneficios" className="hover:text-emerald-400 transition">Beneficios</a>
            <a href="#rubros" className="hover:text-emerald-400 transition">Para tu Negocio</a>
            <a href="#precios" className="hover:text-emerald-400 transition">Planes y Precios</a>
            <a href="#testimonios" className="hover:text-emerald-400 transition">Opiniones</a>
            <a href="#faq" className="hover:text-emerald-400 transition">Preguntas Frecuentes</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition border border-slate-700"
            >
              <Smartphone size={15} /> Iniciar Sesión
            </Link>

            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/25 hover:scale-[1.02]"
            >
              Probar Gratis <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        
        {/* Background Decorative Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/20 via-indigo-500/20 to-pink-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles size={14} className="text-amber-300" />
              Tu negocio abierto 24/7 reservando por WhatsApp
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Automatizá la agenda de tu negocio y <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">nunca más pierdas un turno</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              <strong>tuturnito.app</strong> le permite a tus clientes agendar en segundos desde su celular a través de tu propio <strong>WhatsApp</strong>. Ahorrá hasta 3 horas al día de mensajes repetitivos y reducí un 80% los faltantes sin aviso.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              
              <Link
                href="/registro"
                className="w-full sm:w-auto px-8 py-4 text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 hover:scale-[1.02]"
              >
                Empezar Prueba Gratis por 14 Días <ArrowRight size={18} />
              </Link>

              <Link
                href="/admin"
                className="w-full sm:w-auto px-7 py-4 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl transition flex items-center justify-center gap-2"
              >
                <Smartphone size={18} className="text-indigo-400" /> Ver Demostración Interactiva
              </Link>

            </div>

            {/* Social Proof Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" /> Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" /> Configuración en 3 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" /> Soporte personalizado por WhatsApp
              </span>
            </div>

          </div>

          {/* Interactive Live Demo Preview Cards */}
          <div className="mt-14 max-w-5xl mx-auto glass-card p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
            <div className="text-center space-y-1 mb-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Demostración en Vivo</span>
              <h3 className="text-lg font-bold text-white">Probá la experiencia de reserva según el rubro de tu negocio:</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Peluquería / Barbería Demo */}
              <Link 
                href="/reserva/barber-club" 
                target="_blank"
                className="group glass-card p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                    <Scissors size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Peluquerías</span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-amber-400 transition">Barber & Hair Salons</h4>
                <p className="text-xs text-slate-400 mt-1">Multi-barbero, combos de servicios y selección rápida de turnos.</p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Probar Reserva Cliente</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Estética Demo */}
              <Link 
                href="/reserva/estetica-vital" 
                target="_blank"
                className="group glass-card p-5 rounded-2xl border border-pink-500/20 hover:border-pink-500/50 transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20">Estéticas</span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-pink-400 transition">Centros de Estética</h4>
                <p className="text-xs text-slate-400 mt-1">Catálogo de tratamientos, cobro opcional de señas y recordatorio pre-sesión.</p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-pink-400">
                  <span>Probar Reserva Cliente</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Psicología Demo */}
              <Link 
                href="/reserva/mente-sana" 
                target="_blank"
                className="group glass-card p-5 rounded-2xl border border-teal-500/20 hover:border-teal-500/50 transition hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                    <Brain size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">Psicología</span>
                </div>
                <h4 className="font-bold text-white text-base group-hover:text-teal-400 transition">Consultorios de Salud</h4>
                <p className="text-xs text-slate-400 mt-1">Sesiones recurrentes a la misma hora, ficha de paciente y confidencialidad.</p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-teal-400">
                  <span>Probar Reserva Cliente</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>

            </div>
          </div>

        </div>
      </section>

      {/* BENEFICIOS SECCIÓN */}
      <section id="beneficios" className="py-16 lg:py-24 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Por qué elegir tuturnito.app</h2>
            <p className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Diseñado exactamente para resolver el caos de turnos de tu negocio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl inline-block border border-emerald-500/20">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">100% Integrado a WhatsApp</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tus clientes reservan directamente desde WhatsApp sin tener que descargar ninguna aplicación ni registrar contraseñas molestas.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl inline-block border border-indigo-500/20">
                <Smartphone size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Gestioná todo desde tu Celular</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Panel súper intuitivo pensado para usar con una mano. Confirmá, reprogramá o bloqueá horarios en 1 solo toque mientras trabajás.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-3 border border-slate-800">
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl inline-block border border-pink-500/20">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Recordatorios Automáticos Anti-Ausentismo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                El sistema envía notificaciones automáticas 24h y 2h antes del turno solicitando confirmación. Decile chau a los plantones sin aviso.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* PLANES Y PRECIOS SECCIÓN */}
      <section id="precios" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Planes Transparentes</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Elegí el plan perfecto para tu negocio
            </h2>
            <p className="text-sm text-slate-400">
              Todos los planes incluyen <strong>14 días de prueba totalmente gratis</strong>. Cancelá en cualquier momento sin compromisos.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Facturación Mensual</span>
              
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 bg-slate-800 rounded-full p-1 border border-slate-700 relative transition"
              >
                <div className={`w-4 h-4 bg-emerald-400 rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>

              <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                Facturación Anual <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold rounded-full border border-emerald-500/20">Ahorrá 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
            
            {/* PLAN 1: EMPRENDEDOR / INDIVIDUAL */}
            <div className="glass-card p-7 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Plan Emprendedor</h3>
                  <p className="text-xs text-slate-400 mt-1">Ideal para profesionales independientes o consultorios individuales.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">
                    {billingCycle === 'monthly' ? '$14.900' : '$11.900'}
                  </span>
                  <span className="text-xs text-slate-400">/ mes (ARS)</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span><strong>1 Profesional</strong> / Especialista</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Turnos ilimitados por mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Link personalizado `tuturnito.app/tu-negocio`</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Conexión de tu WhatsApp por QR</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Recordatorios automáticos 24h antes</span>
                  </li>
                </ul>
              </div>

              <a
                href="#contacto"
                className="w-full py-3 px-4 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-center border border-slate-700"
              >
                Comenzar 14 Días Gratis
              </a>
            </div>

            {/* PLAN 2: PROFESIONAL (MÁS POPULAR) */}
            <div className="glass-card p-7 rounded-3xl border-2 border-emerald-500/80 relative shadow-2xl shadow-emerald-500/10 flex flex-col justify-between space-y-6 scale-[1.03]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                ⭐ Más Elegido por Peluquerías y Estéticas
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white">Plan Profesional</h3>
                  <p className="text-xs text-slate-300 mt-1">Para equipos de trabajo, barberías y centros de belleza.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {billingCycle === 'monthly' ? '$24.900' : '$19.900'}
                  </span>
                  <span className="text-xs text-slate-400">/ mes (ARS)</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span><strong>Hasta 5 Profesionales / Barberos</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Turnos ilimitados + Fichas de Clientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Cobro opcional de <strong>Señas por Mercado Pago</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Bot interactivo + Recordatorios 24h y 2h antes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Panel táctil Mobile-First multi-equipo</span>
                  </li>
                </ul>
              </div>

              <a
                href="#contacto"
                className="w-full py-3.5 px-4 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition text-center shadow-lg shadow-emerald-500/30"
              >
                Probar Plan Profesional Gratis
              </a>
            </div>

            {/* PLAN 3: MULTI-CENTRO / ENTERPRISE */}
            <div className="glass-card p-7 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 hover:border-slate-700 transition">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Plan Multi-Centro</h3>
                  <p className="text-xs text-slate-400 mt-1">Para grandes clínicas, franquicias o múltiples sucursales.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">
                    {billingCycle === 'monthly' ? '$44.900' : '$35.900'}
                  </span>
                  <span className="text-xs text-slate-400">/ mes (ARS)</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span><strong>Profesionales Ilimitados</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Múltiples números de WhatsApp vinculados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Reportes avanzados de facturación y faltas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-400 shrink-0" />
                    <span>Soporte prioritario VIP 24/7 por llamada</span>
                  </li>
                </ul>
              </div>

              <a
                href="#contacto"
                className="w-full py-3 px-4 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-center border border-slate-700"
              >
                Hablar con Asesor
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* TESTIMONIOS SECCIÓN */}
      <section id="testimonios" className="py-16 lg:py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Historias de Éxito</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Comercios que transformaron su gestión</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Antes perdíamos 2 o 3 turnos por día de gente que se olvidaba. Desde que usamos tuturnito.app con los recordatorios de WhatsApp, la asistencia es casi del 100%."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">M</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Marcos Benítez</h4>
                  <span className="text-[10px] text-slate-400">Dueño de Barber Club BA</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Las clientas aman agendar directo por WhatsApp eligiendo su horario de depilación o facial. A mí me ahorra estar respondiendo mensajes mientras atiendo."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-pink-500/20 text-pink-400 font-bold flex items-center justify-center text-xs">V</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dra. Valeria Gómez</h4>
                  <span className="text-[10px] text-slate-400">Estética & Salud Vital</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Para la consulta psicológica es clave organizar las sesiones fijas semanales. Los pacientes reciben el aviso en WhatsApp y confirman sin tener que llamarlos."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">I</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Lic. Ignacio Rossi</h4>
                  <span className="text-[10px] text-slate-400">Consultorios Mente Sana</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Respuestas Claras</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "¿Cómo se conecta el sistema con el WhatsApp de mi negocio?",
                a: "Simplemente abrís el panel desde tu celular, seleccionás 'Conectar WhatsApp' y escaneás el código QR con el celular de tu comercio (de la misma forma que conectás WhatsApp Web). En 10 segundos queda listo."
              },
              {
                q: "¿Mis clientes necesitan instalar alguna aplicación?",
                a: "No, en absoluto. Tus clientes reservan directamente a través de WhatsApp o mediante el link de reserva web interactivo sin necesidad de descargas ni logins."
              },
              {
                q: "¿Puedo cobrar señas o depósitos antes de confirmar el turno?",
                a: "Sí. Podés activar la opción de seña previa para ciertos servicios (muy utilizado en estéticas o barberías) integrando tu cuenta de Mercado Pago."
              },
              {
                q: "¿Qué sucede si necesito cancelar o mover un turno?",
                a: "Desde tu teléfono tocás en el turno, elegís 'Reagendar' o 'Cancelar' y el sistema notifica automáticamente a tu cliente por WhatsApp."
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="glass-card rounded-2xl border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <ChevronDown size={18} className={`text-emerald-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-tr from-emerald-950 via-slate-900 to-indigo-950 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Empezá a automatizar tus turnos hoy mismo
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Sumate a los cientos de profesionales, barberos y estéticas que ahorran tiempo y aumentan sus ingresos con <strong>tuturnito.app</strong>.
          </p>

          <div className="pt-2">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition shadow-xl shadow-emerald-500/30 hover:scale-105"
            >
              Comenzar Prueba Gratuita de 14 Días <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">tuturnito.app</span>
            <span>— La forma más simple de agendar turnos por WhatsApp.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#beneficios" className="hover:text-slate-300 transition">Beneficios</a>
            <a href="#precios" className="hover:text-slate-300 transition">Planes</a>
            <a href="#faq" className="hover:text-slate-300 transition">FAQ</a>
            <Link href="/admin" className="hover:text-slate-300 transition">Acceso Clientes</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
