# Apple Pie — Backend

## Descripción
API REST para plataforma educativa universitaria con comunidades de estudio,
foros, mentoría, repositorio de recursos y panel administrativo.
Proyecto académico — Desarrollo de aplicaciones ui/ux, Universidad de Ibagué.

## Stack
- Node.js + Express.js
- MySQL2 con pool de conexiones
- JWT para autenticación
- Cloudinary v2 para archivos
- Brevo (@getbrevo/brevo) para emails transaccionales
- Socket.io para tiempo real
- Railway para deploy

## Variables de entorno requeridas
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS,
JWT_SECRET,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
BREVO_API_KEY, BREVO_FROM_EMAIL,
CLIENT_URL

## Instalación local
npm install
# Crear archivo .env con las variables listadas arriba
node server.js

## URL de producción
https://applepie-production.up.railway.app

## Endpoints principales

### Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/mfa/generar   (admin)
POST /api/auth/mfa/verificar (admin)
POST /api/auth/mfa/validar

### Comunidades
GET    /api/comunidades
POST   /api/comunidades          (token)
POST   /api/comunidades/:id/unirse (token)
DELETE /api/comunidades/:id/salir  (token)

### Recursos
GET    /api/recursos
POST   /api/recursos             (token + archivo)
DELETE /api/recursos/:id         (token)

### Foro
GET    /api/comunidades/:id/foro
POST   /api/comunidades/:id/foro (token)
POST   /api/comunidades/:comunidadId/foro/:publicacionId/respuestas (token)

### Mentoría
GET  /api/mentoras
POST /api/mentoras/postularse    (token)
POST /api/sesiones               (token)
PUT  /api/sesiones/:id           (token)
POST /api/sesiones/:id/valorar   (token)

### Pagos
POST  /api/pagos                 (token)
GET   /api/pagos/historial       (token)
PATCH /api/pagos/:id/estado      (token, admin)

### Reportes
POST  /api/reportes              (token)
GET   /api/reportes              (token, admin)
PATCH /api/reportes/:id/resolver (token, admin)

### Admin
GET   /api/admin/usuarios        (token, admin)
PATCH /api/admin/usuarios/:id/rol    (token, admin)
PATCH /api/admin/usuarios/:id/activo (token, admin)

### Perfil
GET   /api/perfil                (token)
PUT   /api/perfil                (token)
PATCH /api/perfil/foto           (token)

### Notificaciones
GET   /api/notificaciones        (token)
PATCH /api/notificaciones/leer-todas (token)
PATCH /api/notificaciones/:id/leer   (token)

## Socket.io — eventos
- registrar_usuario
- unirse_comunidad
- nuevo_mensaje → mensaje_recibido
- nueva_notificacion

## Seguridad
- Helmet (headers HTTP seguros)
- Rate limiting: 100 req/15min general, 10 req/15min en /auth, 20/hora en uploads
- JWT con expiración 8h
- bcryptjs para contraseñas
- Roles: estudiante | mentora | moderadora | admin
