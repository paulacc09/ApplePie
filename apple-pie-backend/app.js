const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
