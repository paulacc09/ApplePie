# Apple Pie — Frontend

Cliente web de la plataforma educativa **Apple Pie** (comunidades, mentoría, repositorio, foro y paneles por rol). Proyecto académico UI/UX — React + Vite.

## Stack

- **React 19** + **React Router 6**
- **Vite 8** (HMR, build estático)
- **Tailwind CSS 3** (tema propio: `cream`, `rose`, `olive`, `warm`, `ink`, `stone`, `faded`, `line`, `blush`, `mint`, `muted`, etc. en `tailwind.config.js`)
- **Axios** (`src/api/axios.js`): instancia con `baseURL` desde `import.meta.env.VITE_API_BASE_URL` o fallback a producción Railway; interceptor JWT (`localStorage` clave `apple-pie-token`)
- Dependencias adicionales en `package.json`: `@tanstack/react-query`, `zustand` (disponibles si se quieren usar)

## Scripts

```bash
npm install
npm run dev          # desarrollo (Vite)
npm run build        # producción → dist/
npm run preview      # vista previa del build
npm run lint         # ESLint
```

Variables: crear `.env` con `VITE_API_BASE_URL` apuntando al backend (ej. `http://localhost:3000`).

## Estructura de carpetas (`src/`)

| Ruta | Descripción |
|------|-------------|
| `main.jsx` | Montaje de React, `BrowserRouter`, providers (`AuthProvider`, `ThemeProvider`) |
| `App.jsx` | Raíz que renderiza `AppRoutes` |
| `routes/AppRoutes.jsx` | Definición de rutas públicas y privadas |
| `layouts/PublicLayout.jsx` | Layout sin sidebar (landing, login, registro) |
| `layouts/PrivateLayout.jsx` | Layout autenticado: `Navbar`, `Sidebar`, `Outlet`, `BottomNav` |
| `components/` | UI reutilizable: `Navbar`, `Sidebar`, `BottomNav`, `PrivateRoute`, `LogoApplePie`, `ComunidadCard`, `MentorCard`, `ModalPago`, `ModalSubirRecurso`, … |
| `context/AuthContext.jsx` | Sesión: `user`, `token`, `login`, `register`, `logout`; persiste usuario en `apple-pie-user` |
| `context/ThemeContext.jsx` | Tema claro/oscuro y `localStorage` |
| `api/axios.js` | Cliente HTTP exportado como `api` (named) y default |
| `lib/apiError.js` | `getErrorMessage(err)` para mensajes de error de API |
| `pages/` | Una vista por archivo (ver tabla de rutas abajo) |
| `index.css` | Tailwind + estilos globales |
| `assets/` | Imágenes estáticas |

## Rutas (`AppRoutes.jsx`)

**Públicas** (`PublicLayout`): `/` (Landing), `/login`, `/registro`.

**Privadas** (`PrivateRoute` → `PrivateLayout`): requieren token; si no hay sesión, redirección a `/login`.

| Ruta | Página | Notas breves |
|------|--------|----------------|
| `/home` | `Home.jsx` | Inicio |
| `/comunidades` | `Comunidades.jsx` | Listado comunidades |
| `/comunidades/:id` | `ComunidadDetalle.jsx` | Tabs foro / miembros / recursos / calendario; API comunidades + en parte legacy `/api/grupos/...` |
| `/repositorio` | `Repositorio.jsx` | Recursos |
| `/foro` | `Foro.jsx` | Foro global: `GET`/`POST` `/api/foro` (contrato esperado por el front) |
| `/mentoria` | `Mentoria.jsx` | Listado mentoras |
| `/mentoria/:id` | `PerfilMentora.jsx` | Perfil mentora + modal pago |
| `/perfil` | `MiPerfil.jsx` | Perfil usuaria (parte mock) |
| `/agenda` | `MiAgenda.jsx` | Agenda usuaria |
| `/mentora/dashboard` | `DashboardMentora.jsx` | KPI y resumen mentora |
| `/mentora/agenda` | `AgendaMentora.jsx` | Calendario + historial + semana |
| `/mentora/materiales` | `MaterialesMentora.jsx` | Materiales |
| `/mentora/perfil` | `EditarPerfilMentora.jsx` | Edición perfil mentora |
| `/moderadora/reportes` | `ModeradoraReportes.jsx` | Reportes activos |
| `/moderadora/historial` | `ModeradoraHistorial.jsx` | Historial moderación |
| `/moderadora/comunidades` | `ModeradoraComunidades.jsx` | Comunidades moderadas |
| `/admin/dashboard` | `AdminDashboard.jsx` | Panel admin (KPI, acciones, log) |
| `/admin/usuarios` | `AdminUsuarios.jsx` | Gestión usuarias |
| `/admin/pagos` | `AdminPagos.jsx` | Pagos/planes (contratos `/api/admin/...`) |
| `/admin/reportes` | `AdminReportes.jsx` | Métricas y export |

`Sidebar` y `BottomNav` enlazan según rol (`mentora`, `moderadora`, etc.).

## Autenticación

- **Login**: email, contraseña y selector de rol (`estudiante` | `moderador` | `admin`) enviados en `POST /api/auth/login` vía `AuthContext.login`.
- Token JWT guardado; cabecera `Authorization: Bearer …` en axios.

## Convenciones de UI

- Tarjetas: `rounded-2xl border border-line bg-warm` o `bg-white`, `shadow-card`.
- Tipografía display: `font-display`; cuerpo: sans por defecto.
- Errores de red/API: `getErrorMessage` + `alert` o bloques `bg-blush border-rose` según pantalla.

## Integración con el backend

El front asume una API REST bajo `VITE_API_BASE_URL`. Algunas pantallas de **administración** consumen rutas `/api/admin/...` pensadas para un backend extendido: si no están implementadas, la UI puede quedar vacía o con error controlado.

Rutas de **comunidad** que aún pueden usar prefijos legacy tipo `/api/grupos/:id/...` conviven con `/api/comunidades/...` según evolución del API.

## Pagos (usuaria)

No existe hoy una página dedicada tipo `Pagos.jsx` para el historial de egresos de la usuaria. El listado de pagos del usuario en backend se expone como **`GET /api/pagos/historial`** (ver README del backend). Cuando se añada una vista de “mis pagos”, conviene enlazarla ahí.

## NOTA — Ingresos mentora vs egresos

`GET /api/pagos` / historial de pagos del usuario refleja **pagos realizados por la usuaria** (egresos). Para un KPI de **ingresos como mentora** haría falta un endpoint dedicado (p. ej. filtrar pagos ligados a sesiones donde la mentora es la receptora). Hasta entonces el KPI “Ingresos este mes” en el dashboard de mentora puede mostrarse como `—` (comentario alineado con el producto).

-----

Proyecto: **Apple Pie** — Universidad de Ibagué (UI/UX). ---------
