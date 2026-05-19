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
| `layouts/PrivateLayout.jsx` | Layout autenticado responsive: `Navbar`, `Sidebar`, `Outlet`, `BottomNav`; `main` usa `min-w-0` para evitar desborde junto al sidebar |
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
| `/comunidades/:id` | `ComunidadDetalle.jsx` | Tabs foro / miembros / recursos / calendario; eventos de comunidad vía `GET/POST /api/comunidades/:id/eventos` |
| `/repositorio` | `Repositorio.jsx` | Recursos |
| `/foro` | `Foro.jsx` | Foro global: `GET`/`POST` `/api/foro` |
| `/mentoria` | `Mentoria.jsx` | Listado mentoras |
| `/mentoria/:id` | `PerfilMentora.jsx` | Perfil mentora + modal pago |
| `/perfil` | `MiPerfil.jsx` | Perfil usuaria (parte mock) |
| `/agenda` | `MiAgenda.jsx` | Agenda global unificada vía `GET /api/eventos`: eventos de comunidad + sesiones de mentoría |
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

`Sidebar` muestra el bloque **Mentora** (`/mentora/...`) cuando `user.rol === 'mentora'`. `BottomNav` es común a todas las usuarias autenticadas.

## Autenticación

- **Login** (`Login.jsx`): solo email y contraseña. `AuthContext.login(email, password)` envía `POST /api/auth/login` con body `{ email, password }` (sin selector de rol; el rol viene del usuario en BD y va en el JWT).
- Token JWT en `localStorage` (`apple-pie-token`); usuario en `apple-pie-user`. Axios añade `Authorization: Bearer …` en las peticiones.

## Convenciones de UI

- Tarjetas: `rounded-2xl border border-line bg-warm` o `bg-white`, `shadow-card`.
- Tipografía display: `font-display`; cuerpo: sans por defecto.
- Errores de red/API: `getErrorMessage` + `alert` o bloques `bg-blush border-rose` según pantalla.
- Layout privado: las páginas principales usan wrapper `w-full max-w-4xl mx-auto px-6 py-6`; el layout raíz usa `overflow-hidden` y el `main` usa `min-w-0 flex-1 overflow-auto` para evitar scroll horizontal global.

## Integración con el backend

El front consume una API REST mediante `src/api/axios.js`.

- `baseURL`: `import.meta.env.VITE_API_BASE_URL` o fallback `https://applepie-production.up.railway.app`.
- Auth: el interceptor agrega `Authorization: Bearer <token>` cuando existe `apple-pie-token`.
- Errores `401`: el interceptor borra token/usuario y redirige a `/login`.
- Login actual: `POST /api/auth/login` con body `{ email, password }`; el rol llega desde la BD en la respuesta/JWT.

En deploy, Vercel debe definir `VITE_API_BASE_URL` con la URL pública del backend. El backend actual responde preflight con `OPTIONS /{*path}` y CORS está configurado en `app.js`.

## Conexión actual por pantalla

| Pantalla | Endpoints reales conectados | Estado |
|----------|-----------------------------|--------|
| `Login.jsx` | `POST /api/auth/login` | Real. Solo email/password. |
| `Registro.jsx` | `POST /api/auth/register` | Real. Registro crea rol `estudiante` en backend. |
| `Home.jsx` | `GET /api/comunidades`, `GET /api/recursos` | Real con fallbacks de UI. |
| `Comunidades.jsx` | `GET /api/comunidades`, `POST /api/comunidades` | Real; crear comunidad requiere token. |
| `ComunidadCard.jsx` | `POST /api/comunidades/:id/unirse` | Real; requiere token. |
| `ComunidadDetalle.jsx` | `GET /api/comunidades/:id`, `GET /api/comunidades/:id/miembros`, `GET/POST /api/comunidades/:id/foro`, `GET/POST /api/comunidades/:id/eventos`, `GET /api/recursos?comunidad_id=:id` | Real. El calendario crea eventos en `eventos_comunidad`; al crear evento virtual abre Google Calendar con `vcon=meet`. |
| `Repositorio.jsx` | `GET /api/recursos` | Real. |
| `ModalSubirRecurso.jsx` | `POST /api/recursos` multipart | Real; requiere token. |
| `Foro.jsx` | `GET/POST /api/foro` | Real. Foro global separado del foro por comunidad. |
| `Mentoria.jsx` | `GET /api/mentoras`, `POST /api/mentoras/postularse` | Real. |
| `PerfilMentora.jsx` | `GET /api/mentoras/:id` | Real para perfil base; tarifas/pago siguen mock/parcial. |
| `MiAgenda.jsx` | `GET /api/eventos` | Real. Agenda global de solo lectura: une eventos de comunidad y sesiones de mentoría; muestra `Unirse` si hay link o `Programar` para eventos virtuales sin link. |
| `DashboardMentora.jsx` | `GET /api/sesiones/mentora`, `GET /api/sesiones/mentora?estado=pendiente`, `GET /api/mentoras` | Real. KPI de ingresos no disponible. |
| `AgendaMentora.jsx` | `GET /api/sesiones/mentora`, `PUT /api/sesiones/:id` | Real para listar/confirmar sesiones. |
| `AdminUsuarios.jsx` | `GET /api/admin/usuarios` | Parcial. La UI también llama PATCH/DELETE con contratos distintos a los del backend actual (`/rol`, `/activo`). |
| `AdminDashboard.jsx` | `/api/admin/stats`, `/api/admin/log`, `/api/admin/backup`, `/api/admin/anuncio` | Pendiente en backend actual. |
| `AdminPagos.jsx` | `/api/admin/pagos/...`, `/api/admin/planes` | Pendiente en backend actual. |
| `AdminReportes.jsx` | `/api/admin/reportes/...` | Pendiente en backend actual. |
| `Moderadora*.jsx` | `/api/moderacion/...` | Pendiente en backend actual. |

## Mocks / pendientes relevantes

- `MiAgenda.jsx`: ya no usa eventos fake ni botón de creación; muestra la agenda unificada desde `GET /api/eventos`.
- `ComunidadDetalle.jsx`: el botón **Crear evento** solo existe en la pestaña Calendario de la comunidad. Guarda el evento con `meet_link: null` y, si es virtual, abre Google Calendar con datos prellenados y `vcon=meet`.
- `PerfilMentora.jsx`: tarifas, compra y `ModalPago` siguen sin pago real.
- `DashboardMentora.jsx`: “Ingresos este mes” no puede calcularse sin endpoint de ingresos para mentora.
- Admin/moderación: varias pantallas apuntan a endpoints planeados pero no implementados en el router actual.

## Pagos (usuaria)

No existe hoy una página dedicada tipo `Pagos.jsx` para el historial de egresos de la usuaria. El listado de pagos del usuario en backend se expone como **`GET /api/pagos/historial`** (ver README del backend). Cuando se añada una vista de “mis pagos”, conviene enlazarla ahí.

## NOTA — Ingresos mentora vs egresos

`GET /api/pagos` / historial de pagos del usuario refleja **pagos realizados por la usuaria** (egresos). Para un KPI de **ingresos como mentora** haría falta un endpoint dedicado (p. ej. filtrar pagos ligados a sesiones donde la mentora es la receptora). Hasta entonces el KPI “Ingresos este mes” en el dashboard de mentora puede mostrarse como `—` (comentario alineado con el producto).

---

Proyecto: **Apple Pie** — Universidad de Ibagué (UI/UX).
