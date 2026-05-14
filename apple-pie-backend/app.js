const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const comunidadesRoutes = require('./src/routes/comunidades');
const recursosRoutes = require('./src/routes/recursos');
const mentorasRoutes = require('./src/routes/mentoras');
const foroRoutes = require('./src/routes/foro');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', proyecto: 'Apple Pie' });
});

app.use('/api/auth', authRoutes);
app.use('/api/comunidades', comunidadesRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/mentoras', mentorasRoutes);
app.use('/api', foroRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
