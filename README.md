# 📅 tuturnito.app — Sistema Inteligente de Gestión de Turnos por WhatsApp

[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![WhatsApp Integration](https://img.shields.io/badge/WhatsApp-Automation-25D366?style=flat-square&logo=whatsapp)](https://wa.me)
[![License](https://img.shields.io/badge/License-MIT-green.style=flat-square)]()

**tuturnito.app** es una plataforma integral de gestión de turnos diseñada especialmente para **Peluquerías & Barberías, Centros de Estética y Consultorios de Psicología/Salud**.

Permite a los negocios administrar su agenda fácilmente desde su smartphone mediante un panel táctil intuitivo, mientras que los clientes finales pueden reservar sus turnos en 3 clics directamente desde **WhatsApp**.

---

## ✨ Características Principales

### 🌐 1. Landing Page Comercial de Alta Conversión (`/`)
- Presentación orientada al cliente final con la propuesta de valor de **tuturnito.app**.
- **Planes de Suscripción**: Plan Emprendedor ($14.900), Plan Profesional ($24.900) y Plan Multi-Centro ($44.900).
- **Demos Interactivas en Vivo** por rubro (Peluquería, Estética, Psicología).
- Testimonios reales y sección de preguntas frecuentes (FAQ).

### 📱 2. Panel Administrativo del Negocio (Mobile-First) (`/admin`)
- **Agenda Diaria y Semanal**: Visualización panorámica de los 7 días de la semana o vista diaria detallada con acciones en 1 toque.
- **Acciones Rápidas (1-Tap)**: Confirmar por WhatsApp, Completar, Cancelar o Carga Manual Veloz de turnos.
- **Validación Anti-Superposición**: Bloqueo automático de doble reserva para un mismo horario y profesional.
- **Gestión de Horarios de Atención**: Apertura/cierre por día, pausas de almuerzo e intervalos configurables (15, 30, 45, 60 min).
- **CRUD de Profesionales**: Alta, edición, inhabilitación y eliminación de especialistas con avatares predefinidos.
- **Conexión WhatsApp QR**: Vinculación del número propio del negocio escaneando un código QR.

### 🔗 3. Micro-App de Reserva para Clientes (`/reserva/[slug]`)
- Experiencia de reserva ultra-rápida sin descargas ni registros.
- Selección visual de Servicio, Profesional, Fecha y Horarios Disponibles.
- **Horarios Bloqueados**: Deshabilitación visual automática con badge *"Ocupado"* para turnos tomados y opción *"Ocultar ocupados"*.
- Notificación instantánea y confirmación enviada al chat de WhatsApp del comercio.

### 👑 4. Dashboard Super Admin Global (`/superadmin`)
- Control de empresas registradas, usuarios atendidos acumulados y métricas SaaS.
- Alta rápida de nuevos comercios e impersonación para soporte técnico.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14+ (App Router).
- **Lenguaje**: TypeScript.
- **Estilos**: Tailwind CSS + Glassmorphism UI.
- **Iconos**: Lucide React.
- **WhatsApp Gateway**: Integración con Evolution API / Meta Cloud API.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18+ instalado.
- npm o yarn.

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/tuturnito-app.git
   cd tuturnito-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. Abrir en el navegador: [http://localhost:3000](http://localhost:3000) (o el puerto asignado).

---

## 📂 Estructura del Proyecto

```text
sistemaDeTurnos/
├── src/
│   ├── app/
│   │   ├── admin/          # Panel de Administración Mobile-First del Negocio
│   │   ├── reserva/        # Micro-App de Reserva Web para Clientes (/reserva/[slug])
│   │   ├── superadmin/     # Dashboard Super Admin (Plataforma Master)
│   │   ├── globals.css     # Estilos globales y utilidades glassmorphism
│   │   └── page.tsx        # Landing Page comercial tuturnito.app
│   ├── lib/
│   │   └── mockStore.ts    # Datos iniciales y tienda reactiva local
│   └── types/
│       └── saas.ts         # Tipos de TypeScript (Tenants, Turnos, Horarios, Profesionales)
├── public/                 # Archivos estáticos
├── package.json
└── README.md
```

---

## ☁️ Despliegue en Producción

Consulta la guía detallada de despliegue a la nube en [`guia_despliegue_nube_tuturnito.md`](./guia_despliegue_nube_tuturnito.md).

- **Frontend**: [Vercel](https://vercel.com)
- **Base de Datos**: [Supabase](https://supabase.com) / [Neon](https://neon.tech)
- **Motor WhatsApp**: [Evolution API](https://github.com/EvolutionAPI/evolution-api) en Railway o VPS Docker.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
