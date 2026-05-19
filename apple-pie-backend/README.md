# Apple Pie — Backend

API REST para la plataforma educativa **Apple Pie**: comunidades, eventos de comunidad, agenda global, foro global y por comunidad, recursos, mentorías (sesiones), pagos, reportes, administración básica de usuarios, perfil y notificaciones. Proyecto académico — Universidad de Ibagué.

## Stack

- **Node.js** + **Express 5**
- **MySQL2** (pool en `src/config/db.js`)
- **JWT** (`jsonwebtoken`) — middleware `verificarToken.js`
- **Roles** — `verificarRol.js` (p. ej. `admin`)
- **bcryptjs** (contraseñas)
- **Helmet**, **CORS**, **express-rate-limit**
- **Cloudinary** + **multer** (subidas; `src/utils/cloudinary.js`)
- **Brevo** (`@getbrevo/brevo`) — emails (`src/services/emailService.js`)
- **Socket.io** — `src/utils/socket.js`, servidor arrancado desde `server.js`
- **speakeasy** + **qrcode** — MFA para admin

## Arranque

```bash
npm install
# Configurar .env (ver sección siguiente)
npm run dev     # nodemon → server.js
npm start       # node server.js
```

**Punto de entrada:** `server.js` crea el servidor HTTP, inicializa Socket.io y escucha el puerto (por defecto **3000**).

**Aplicación Express:** `app.js` — Helmet, **CORS** (incluye preflight vía `app.options('/{*path}', cors(corsOptions))` para Express 5), rate limits, `express.json`, montaje de routers bajo `/api/...`, manejador de errores 500.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | MySQL |
| `JWT_SECRET` | Firma de tokens |
| `NODE_ENV` | Si vale `production`, el rate limit de `/api/auth` es más estricto (ver sección Seguridad). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Imágenes |
| `BREVO_API_KEY`, `BREVO_FROM_EMAIL` | Correo |
| `CLIENT_URL` / `FRONTEND_URL` | `CLIENT_URL` puede usarse en servicios externos/enlaces. **Estado actual de CORS en `app.js`:** `origin: "*"`, métodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, cabeceras `Content-Type` y `Authorization`, `credentials: true`. |

## Estructura de carpetas (`src/`)

| Ruta | Descripción |
|------|-------------|
| `routes/*.js` | Routers Express por dominio |
| `controllers/*.js` | Lógica HTTP + consultas |
| `middleware/verificarToken.js` | JWT obligatorio |
| `middleware/verificarRol.js` | Roles permitidos |
| `config/db.js` | Pool MySQL2 |
| `services/emailService.js` | Envío de correos (p. ej. confirmación sesión) |
| `utils/cloudinary.js` | Multer / subida |
| `utils/socket.js` | Eventos en tiempo real |

## Routers montados en `app.js`

Prefijo común: raíz del servidor (ej. `http://localhost:3000`).

| Montaje | Archivo | Contenido resumido |
|---------|---------|-------------------|
| `/api/auth` | `routes/auth.js` | Registro, login, MFA (generar/verificar admin, validar) |
| `/api/eventos` | `routes/eventos_global.js` | Agenda global del usuario: eventos de comunidad + sesiones de mentoría |
| `/api/comunidades/:id/eventos` | `routes/eventos_comunidad.js` | Eventos de una comunidad (listar y crear) |
| `/api/comunidades` | `routes/comunidades.js` | CRUD listado/detalle, crear (token), unirse/salir |
| `/api/recursos` | `routes/recursos.js` | Listado y alta con archivo (token) |
| `/api/mentoras` | `routes/mentoras.js` | Listado público, detalle, postularse (token), actualizar perfil |
| `/api/sesiones` | `routes/sesiones.js` | Crear (estudiante), listar mentora/estudiante, `PUT :id`, valorar |
| `/api/pagos` | `routes/pagos.js` | Registrar pago, **historial del usuario**, actualizar estado (admin) |
| `/api/reportes` | `routes/reportes.js` | Crear reporte (token); listar/resolver (admin) |
| `/api/admin` | `routes/admin.js` | Listar usuarios, cambiar rol, activar/desactivar (admin) |
| `/api/notificaciones` | `routes/notificaciones.js` | Listado y marcar leídas |
| `/api/perfil` | `routes/perfil.js` | GET/PUT perfil, PATCH foto |
| `/api/foro` | `routes/foro_global.js` | Foro global (`comunidad_id IS NULL`) |
| `/api` | `routes/foro.js` | Rutas que empiezan por `/comunidades/:comunidadId/foro`… (foro **por comunidad**) |

**Salud:** `GET /api/health`, `GET /` — JSON de bienvenida con enlaces básicos.

## Endpoints principales (referencia rápida)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login` — body: `email`, `password`. Respuesta: `token` + `usuario` (el `rol` viene de la base de datos y se incluye en el JWT; el login no valida un rol enviado en el body).
- `POST /api/auth/mfa/generar` — admin + token
- `POST /api/auth/mfa/verificar` — admin + token
- `POST /api/auth/mfa/validar`

### Comunidades

- `GET /api/comunidades` — query opcional: `asignatura`, `semestre`, `tipo`
- `GET /api/comunidades/:id`
- `POST /api/comunidades` — token
- `POST /api/comunidades/:id/unirse` — token
- `DELETE /api/comunidades/:id/salir` — token

### Eventos y agenda

- `GET /api/comunidades/:id/eventos` — token; eventos de una comunidad, ordenados por fecha/hora.
- `POST /api/comunidades/:id/eventos` — token; crea evento en `eventos_comunidad`.
- `GET /api/eventos` — token; agenda global del usuario. Une:
  - Eventos de comunidades donde el usuario es miembro (`eventos_comunidad`).
  - Sesiones de mentoría donde el usuario es mentora o estudiante (`sesiones`).

Los eventos de comunidad guardan `meet_link` como opcional. El frontend actualmente crea eventos virtuales con `meet_link = null` y abre Google Calendar con `vcon=meet` para que la usuaria programe una sala real.

### Foro global

- `GET /api/foro` — token; publicaciones globales (`publicaciones_foro.comunidad_id IS NULL`).
- `POST /api/foro` — token; crea publicación global.

### Foro por comunidad (router montado en `/api`)

- `GET /api/comunidades/:comunidadId/foro`
- `POST /api/comunidades/:comunidadId/foro` — token
- `DELETE /api/comunidades/:comunidadId/foro/:id` — token
- `GET/POST …/foro/:publicacionId/respuestas` y `DELETE …/respuestas/:id`

### Recursos

- `GET /api/recursos`
- `POST /api/recursos` — token, `multipart/form-data`
- `DELETE /api/recursos/:id` — token

### Mentoras

- `GET /api/mentoras`
- `GET /api/mentoras/:id`
- `POST /api/mentoras/postularse` — token
- `PUT /api/mentoras/:id` — token

### Sesiones

- `POST /api/sesiones` — token (estudiante)
- `GET /api/sesiones/mentora` — token; query opcional `estado`
- `GET /api/sesiones/estudiante` — token; query opcional `estado`
- `GET /api/sesiones/:id` — token
- `PUT /api/sesiones/:id` — token (mentora dueña)
- `POST /api/sesiones/:id/valorar` — token

### Pagos

- `POST /api/pagos` — token; registra pago del usuario autenticado (`tipo`, `referencia_id`, `monto`, `metodo`, etc.)
- `GET /api/pagos/historial` — token; **pagos realizados por ese usuario** (egresos), orden `created_at DESC`
- `PATCH /api/pagos/:id/estado` — token + rol **admin**

```text
// NOTA: GET /api/pagos/historial devuelve pagos realizados por el usuario (egresos).
// Para mostrar ingresos de mentora se requiere un endpoint nuevo, p. ej.:
// GET /api/pagos/ingresos-mentora → filtrar pagos donde referencia_id
// corresponde a sesiones con mentora_id === req.usuario.id.
// Hasta que exista, el KPI "Ingresos este mes" en DashboardMentora puede permanecer como '—'.
```

### Reportes

- `POST /api/reportes` — token
- `GET /api/reportes` — token + admin
- `PATCH /api/reportes/:id/resolver` — token + admin

### Admin (usuarios)

- `GET /api/admin/usuarios` — admin
- `PATCH /api/admin/usuarios/:id/rol` — admin
- `PATCH /api/admin/usuarios/:id/activo` — admin

> Las pantallas **Admin*** del frontend (`/api/admin/stats`, `/api/admin/log`, `/api/admin/backup`, `/api/admin/anuncio`, planes, pagos admin y reportes agregados) apuntan a rutas **no incluidas aún** en este router; implementarlas o alinear el front cuando el API esté completo.

### Perfil

- `GET /api/perfil` — token
- `PUT /api/perfil` — token
- `PATCH /api/perfil/foto` — token, multipart

### Notificaciones

- `GET /api/notificaciones` — token
- `PATCH /api/notificaciones/leer-todas` — token
- `PATCH /api/notificaciones/:id/leer` — token

## Socket.io (resumen)

Registro de usuario, unirse a comunidad, mensajes y notificaciones — ver `src/utils/socket.js` y eventos usados por el cliente.

## Mapa frontend ↔ backend

| Frontend | Backend actual | Estado |
|----------|----------------|--------|
| `Login.jsx` | `POST /api/auth/login` | Conectado. Body `{ email, password }`; el rol viene desde `usuarios.rol` y se firma en JWT. |
| `Registro.jsx` | `POST /api/auth/register` | Conectado. El backend registra rol `estudiante`. |
| `Home.jsx`, `Comunidades.jsx` | `GET /api/comunidades` | Conectado. |
| `Comunidades.jsx` | `POST /api/comunidades` | Conectado con token. |
| `ComunidadCard.jsx` | `POST /api/comunidades/:id/unirse` | Conectado con token. |
| `ComunidadDetalle.jsx` | `GET /api/comunidades/:id`, `GET /api/comunidades/:id/miembros`, `GET/POST /api/comunidades/:id/foro`, `GET/POST /api/comunidades/:id/eventos` | Conectado. El calendario usa `eventos_comunidad`, separado de `sesiones` de mentoría. |
| `Foro.jsx` | `GET/POST /api/foro` | Conectado. Foro global con `comunidad_id IS NULL`. |
| `Repositorio.jsx`, `ModalSubirRecurso.jsx` | `GET /api/recursos`, `POST /api/recursos`, `GET /api/recursos/:id`, `DELETE /api/recursos/:id` | Conectado; subida usa multipart y Cloudinary. |
| `Mentoria.jsx`, `PerfilMentora.jsx` | `GET /api/mentoras`, `POST /api/mentoras/postularse`, `GET /api/mentoras/:id`, `PUT /api/mentoras/:id` | Conectado para perfil/listado/postulación. Tarifas y pago del perfil aún no tienen endpoints dedicados. |
| `MiAgenda.jsx` | `GET /api/eventos` | Conectado. Agenda global unificada con eventos de comunidad y sesiones de mentoría. |
| `AgendaMentora.jsx`, `DashboardMentora.jsx` | `GET /api/sesiones/mentora`, `GET /api/sesiones/mentora?estado=...`, `PUT /api/sesiones/:id` | Conectado. Confirmar sesión usa `PUT`. |
| `PerfilMentora.jsx` / `ModalPago.jsx` | `POST /api/pagos` | Parcial. Backend existe, pero modal del front aún no crea pago real ni sesión real. |
| Admin usuarios | `GET /api/admin/usuarios`, `PATCH /api/admin/usuarios/:id/rol`, `PATCH /api/admin/usuarios/:id/activo` | Parcial. Front actual lista usuarios, pero algunas acciones usan contratos distintos. |
| Admin dashboard/pagos/reportes | `/api/admin/stats`, `/api/admin/log`, `/api/admin/pagos/...`, `/api/admin/reportes/...` | Pendiente en backend actual. |
| Moderadora | `/api/moderacion/...` | Pendiente en backend actual. |

## Seguridad

- **Helmet** y **rate limiting:** límite global (100 req / 15 min por IP) + límite extra en `/api/auth` (**10** / 15 min si `NODE_ENV === 'production'`, **500** / 15 min en otro caso) + límites en subidas (`/api/recursos`, `/api/perfil/foto`).
- **CORS** (`app.js`): objeto `corsOptions` antes de los routers, métodos que incluyen `OPTIONS`, y `app.options('/{*path}', cors(corsOptions))` para responder preflight en Express 5 (evita `OPTIONS 404` desde orígenes como Vercel).
- JWT con caducidad configurada en auth; contraseñas con **bcrypt** en registro y `bcrypt.compare` en login.
- Roles en BD alineados con el front: `estudiante`, `mentora`, `moderadora`, `admin` (según migraciones / datos reales).

## Deploy

Producción de referencia: **Railway** — URL pública usada como fallback en el front si no hay `VITE_API_BASE_URL`. En Vercel, definir `VITE_API_BASE_URL` apuntando al backend. Si se endurece CORS para producción, cambiar `origin: "*"` por `process.env.FRONTEND_URL` y definir `FRONTEND_URL` con el dominio del front.

---

**Apple Pie** — API backend del ecosistema web descrito en `apple-pie-frontend/README.md`.
