'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  MessageSquare, 
  Scissors, 
  Sparkles, 
  Brain, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { Tenant, Service, Professional, Appointment, RubroType } from '@/types/saas';
import { 
  INITIAL_TENANTS, 
  INITIAL_SERVICES, 
  INITIAL_PROFESSIONALS, 
  INITIAL_APPOINTMENTS,
  DEFAULT_SCHEDULE 
} from '@/lib/mockStore';

export default function ClientBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  // Booking Flow Steps: 1 = Service/Prof, 2 = Date/Time, 3 = Client Details, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('14:30');

  // Client Info State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // Load Tenant by slug
    const savedTenants = localStorage.getItem('saas_tenants');
    const tenantsList: Tenant[] = savedTenants ? JSON.parse(savedTenants) : INITIAL_TENANTS;
    const found = tenantsList.find(t => t.slug === slug) || tenantsList[0];
    setTenant(found);

    // Load Services & Professionals
    const savedServs = localStorage.getItem('saas_services');
    const servList: Service[] = savedServs ? JSON.parse(savedServs) : INITIAL_SERVICES;
    setServices(servList.filter(s => s.tenantId === found.id));

    const savedProfs = localStorage.getItem('saas_professionals');
    const profList: Professional[] = savedProfs ? JSON.parse(savedProfs) : INITIAL_PROFESSIONALS;
    setProfessionals(profList.filter(p => p.tenantId === found.id));
  }, [slug]);

  const [hideOccupied, setHideOccupied] = useState(false);

  const generateDynamicSlots = () => {
    if (!tenant) return [];
    
    // Read saved appointments to check occupied slots
    const savedApps = typeof window !== 'undefined' ? localStorage.getItem('saas_appointments') : null;
    const appList: Appointment[] = savedApps ? JSON.parse(savedApps) : INITIAL_APPOINTMENTS;
    
    // Filter active appointments for this tenant, date, and selected professional
    const activeApps = appList.filter(app => 
      app.tenantId === tenant.id && 
      app.date === selectedDate && 
      app.status !== 'cancelled' &&
      (!selectedProf || app.professionalId === selectedProf.id)
    );

    const occupiedTimesSet = new Set(activeApps.map(a => a.time));

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayIndex = dateObj.getDay();
    const dayKeys: ('domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado')[] = [
      'domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'
    ];
    const dayKey = dayKeys[dayIndex];

    const tenantSchedule = tenant.schedule || DEFAULT_SCHEDULE;
    const dayConfig = tenantSchedule.find(d => d.day === dayKey);

    if (!dayConfig || !dayConfig.isOpen) {
      return [];
    }

    const interval = tenant.slotIntervalMinutes || 30;
    const slots: { time: string; isAvailable: boolean }[] = [];

    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (m: number) => {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const mins = (m % 60).toString().padStart(2, '0');
      return `${h}:${mins}`;
    };

    const startMin = timeToMinutes(dayConfig.openTime || '09:00');
    const closeMin = timeToMinutes(dayConfig.closeTime || '19:00');

    let breakStartMin = dayConfig.hasBreak ? timeToMinutes(dayConfig.breakStart || '13:00') : -1;
    let breakEndMin = dayConfig.hasBreak ? timeToMinutes(dayConfig.breakEnd || '14:00') : -1;

    for (let current = startMin; current < closeMin; current += interval) {
      if (dayConfig.hasBreak && current >= breakStartMin && current < breakEndMin) {
        continue;
      }
      const timeStr = minutesToTime(current);
      const isAvailable = !occupiedTimesSet.has(timeStr);
      slots.push({ time: timeStr, isAvailable });
    }

    return slots;
  };

  const dynamicSlots = generateDynamicSlots();

  if (!tenant) return null;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedProf || !clientName || !clientPhone) return;

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      tenantId: tenant.id,
      professionalId: selectedProf.id,
      serviceId: selectedService.id,
      clientName,
      clientPhone,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      depositPaid: false,
      notes: clientNotes
    };

    // Save to local storage
    const savedApps = localStorage.getItem('saas_appointments');
    const appList: Appointment[] = savedApps ? JSON.parse(savedApps) : INITIAL_APPOINTMENTS;
    const updated = [newApp, ...appList];
    localStorage.setItem('saas_appointments', JSON.stringify(updated));

    setCreatedAppointment(newApp);
    setStep(4);
  };

  const getRubroHeaderBg = (rubro: RubroType) => {
    switch (rubro) {
      case 'peluqueria': return 'from-amber-600 to-orange-600';
      case 'estetica': return 'from-pink-600 to-rose-600';
      case 'psicologia': return 'from-teal-600 to-emerald-600';
    }
  };

  const whatsappMessageText = createdAppointment ? encodeURIComponent(
    `¡Hola ${tenant.name}! Reservé mi turno por la web:\n\n` +
    `👤 *Cliente:* ${clientName}\n` +
    `✂️ *Servicio:* ${selectedService?.name}\n` +
    `👨‍⚕️ *Profesional:* ${selectedProf?.name}\n` +
    `📅 *Fecha:* ${selectedDate}\n` +
    `⏰ *Hora:* ${selectedTime} hs\n\n` +
    `¿Podrían confirmarme mi turno? ¡Gracias!`
  ) : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6">
      
      {/* Container Card */}
      <div className="glass-card max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        
        {/* Business Header Banner */}
        <div className={`p-6 bg-gradient-to-r ${getRubroHeaderBg(tenant.rubro)} text-white space-y-2 relative`}>
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 bg-black/20 backdrop-blur-md text-xs font-bold rounded-full uppercase tracking-wider">
              {tenant.rubro}
            </span>
            <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} /> Reserva Instantánea
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight">{tenant.name}</h1>
          <p className="text-xs text-white/80">Elegí tu turno en 3 simples pasos</p>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className={step >= 1 ? 'text-indigo-400 font-bold' : ''}>1. Servicio</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-indigo-400 font-bold' : ''}>2. Horario</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-indigo-400 font-bold' : ''}>3. Datos</span>
        </div>

        <div className="p-6 space-y-6">

          {/* STEP 1: SERVICE & PROFESSIONAL */}
          {step === 1 && (
            <div className="space-y-5">
              
              {/* Services List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Seleccioná el Servicio</h3>
                
                <div className="space-y-2">
                  {services.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedService?.id === s.id
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">⏱️ {s.durationMinutes} min de duración</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-emerald-400">${s.price.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professionals List */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Seleccioná el Profesional</h3>

                <div className="grid grid-cols-2 gap-2">
                  {professionals.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProf(p)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2.5 ${
                        selectedProf?.id === p.id
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* eslint-disable-next-html-next-element */}
                      <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.specialty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Button */}
              <button
                disabled={!selectedService || !selectedProf}
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                Siguiente: Ver Horarios Disponibles <ChevronRight size={16} />
              </button>

            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-5">
              <button 
                onClick={() => setStep(1)} 
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Volver a selección
              </button>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seleccionar Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Horarios Disponibles</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideOccupied}
                      onChange={(e) => setHideOccupied(e.target.checked)}
                      className="w-3.5 h-3.5 accent-indigo-500 rounded"
                    />
                    <span>Ocultar ocupados</span>
                  </label>
                </div>

                {dynamicSlots.length === 0 ? (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
                    <p className="text-xs text-rose-400 font-bold">🚫 El negocio permanece cerrado este día.</p>
                    <p className="text-[11px] text-slate-400">Por favor seleccioná otra fecha de atención.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                    {dynamicSlots
                      .filter(slot => !hideOccupied || slot.isAvailable)
                      .map(slot => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => {
                            if (slot.isAvailable) setSelectedTime(slot.time);
                          }}
                          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition border flex flex-col items-center justify-center ${
                            !slot.isAvailable
                              ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed opacity-50 line-through'
                              : selectedTime === slot.time 
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span>{slot.time}</span>
                          {!slot.isAvailable && (
                            <span className="text-[9px] no-underline text-rose-500 font-semibold">Ocupado</span>
                          )}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3.5 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                Siguiente: Ingresar mis Datos <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 3: CLIENT DETAILS FORM */}
          {step === 3 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <button 
                type="button"
                onClick={() => setStep(2)} 
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Volver a horarios
              </button>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 block">Resumen del Turno:</span>
                <p className="font-bold text-white">{selectedService?.name} con {selectedProf?.name}</p>
                <p className="text-indigo-400 font-semibold">📅 {selectedDate} a las {selectedTime} hs</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Matías Gómez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 1234-5678"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Comentario o aclaración (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Primera sesión, tinte rubio, etc."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                Confirmar Reserva Instantánea 🚀
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 4 && (
            <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">¡Turno Solicitado con Éxito!</h3>
                <p className="text-xs text-slate-300">Hemos registrado tu reserva para {tenant.name}.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1.5">
                <p className="text-slate-400">📅 <strong>Fecha:</strong> {selectedDate} a las {selectedTime} hs</p>
                <p className="text-slate-400">✂️ <strong>Servicio:</strong> {selectedService?.name}</p>
                <p className="text-slate-400">👤 <strong>Atendido por:</strong> {selectedProf?.name}</p>
              </div>

              <a
                href={`https://wa.me/${(tenant.whatsappConfig.phoneNumber || tenant.phone).replace(/[^0-9]/g, '')}?text=${whatsappMessageText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} /> Enviar Confirmación al WhatsApp del Negocio
              </a>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
