# Apple Pie — Backend

API REST para la plataforma educativa **Apple Pie**: comunidades, foro por comunidad, recursos, mentorías (sesiones), pagos, reportes, administración básica de usuarios, perfil y notificaciones. Proyecto académico — Universidad de Ibagué.

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

**Aplicación Express:** `app.js` — Helmet, rate limits, **CORS** (incluye `OPTIONS` vía `app.options('*', cors(corsOptions))`), `express.json`, montaje de routers bajo `/api/...`, manejador de errores 500.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | MySQL |
| `JWT_SECRET` | Firma de tokens |
| `NODE_ENV` | Si vale `production`, el rate limit de `/api/auth` es más estricto (ver sección Seguridad). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Imágenes |
| `BREVO_API_KEY`, `BREVO_FROM_EMAIL` | Correo |
| `CLIENT_URL` / `FRONTEND_URL` | **CORS:** `origin` (usar la URL exacta del front en producción, p. ej. Vercel). Con `credentials: true` no debe usarse `*` en el navegador: definir `FRONTEND_URL`. Cabeceras permitidas: `Content-Type`, `Authorization`. Métodos incluyen `OPTIONS` (preflight). |

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
| `/api/comunidades` | `routes/comunidades.js` | CRUD listado/detalle, crear (token), unirse/salir |
| `/api/recursos` | `routes/recursos.js` | Listado y alta con archivo (token) |
| `/api/mentoras` | `routes/mentoras.js` | Listado público, detalle, postularse (token), actualizar perfil |
| `/api/sesiones` | `routes/sesiones.js` | Crear (estudiante), listar mentora/estudiante, `PUT :id`, valorar |
| `/api/pagos` | `routes/pagos.js` | Registrar pago, **historial del usuario**, actualizar estado (admin) |
| `/api/reportes` | `routes/reportes.js` | Crear reporte (token); listar/resolver (admin) |
| `/api/admin` | `routes/admin.js` | Listar usuarios, cambiar rol, activar/desactivar (admin) |
| `/api/notificaciones` | `routes/notificaciones.js` | Listado y marcar leídas |
| `/api/perfil` | `routes/perfil.js` | GET/PUT perfil, PATCH foto |
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

### Foro (por comunidad; router montado en `/api`)

- `GET /api/comunidades/:comunidadId/foro`
- `POST /api/comunidades/:comunidadId/foro` — token
- `DELETE /api/comunidades/:comunidadId/foro/:id` — token
- `GET/POST …/foro/:publicacionId/respuestas` y `DELETE …/respuestas/:id`

> **Nota:** El foro **global** (`GET/POST /api/foro`) lo consume el frontend en `Foro.jsx`; si aún no está implementado en este repo, hay que añadirlo aparte del foro por comunidad.

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

> Las pantallas **Admin*** del frontend (`/api/admin/stats`, `/api/admin/log`, planes, reportes agregados, etc.) pueden apuntar a rutas **no incluidas aún** en este router; implementarlas o alinear el front cuando el API esté completo.

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

## Seguridad

- **Helmet** y **rate limiting:** límite global (100 req / 15 min por IP) + límite extra en `/api/auth` (**10** / 15 min si `NODE_ENV === 'production'`, **500** / 15 min en otro caso) + límites en subidas (`/api/recursos`, `/api/perfil/foto`).
- **CORS** (`app.js`): objeto `corsOptions` con `credentials: true`, métodos que incluyen `OPTIONS`, y `app.options('*', cors(corsOptions))` para responder preflight (evita `OPTIONS 404` desde orígenes como Vercel).
- JWT con caducidad configurada en auth; contraseñas con **bcrypt** en registro y `bcrypt.compare` en login.
- Roles en BD alineados con el front: `estudiante`, `mentora`, `moderadora`, `admin` (según migraciones / datos reales).

## Deploy

Producción de referencia: **Railway** — URL pública usada como fallback en el front si no hay `VITE_API_BASE_URL`. En deploy, alinear **`FRONTEND_URL`** (backend) con el dominio del front (Vercel) para CORS y cookies/credenciales si se usan en el futuro.

---

**Apple Pie** — API backend del ecosistema web descrito en `apple-pie-frontend/README.md`.
