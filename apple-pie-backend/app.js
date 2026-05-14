const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const comunidadesRoutes = require('./src/routes/comunidades');
const recursosRoutes = require('./src/routes/recursos');
const mentorasRoutes = require('./src/routes/mentoras');
const sesionesRoutes = require('./src/routes/sesiones');
const pagosRoutes = require('./src/routes/pagos');
const reportesRoutes = require('./src/routes/reportes');
const adminRoutes = require('./src/routes/admin');
const notificacionesRoutes = require('./src/routes/notificaciones');
const perfilRoutes = require('./src/routes/perfil');
const foroRoutes = require('./src/routes/foro');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(helmet());

const corsOptions = {
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta en 15 minutos' },
});

// Auth: producción 10/15min; desarrollo/staging más permisivo para pruebas de login (sigue limitado por limiterGeneral).
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, intenta en 15 minutos' },
});

const limiterUpload = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de subidas alcanzado, intenta en 1 hora' },
});

app.use(limiterGeneral);
app.use('/api/auth', limiterAuth);
app.use('/api/recursos', limiterUpload);
app.use('/api/perfil/foto', limiterUpload);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    proyecto: 'Apple Pie API',
    mensaje: 'Backend activo. El frontend es otra URL (Vite/hosting estático).',
    endpoints: {
      salud: 'GET /api/health',
      registro: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', proyecto: 'Apple Pie' });
});

app.use('/api/auth', authRoutes);
app.use('/api/comunidades', comunidadesRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/mentoras', mentorasRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api', foroRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;