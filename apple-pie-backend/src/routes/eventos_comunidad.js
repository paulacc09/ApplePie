const express = require('express');
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router({ mergeParams: true });

// GET /api/comunidades/:id/eventos
router.get('/', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.nombre, e.descripcion, e.fecha, e.hora,
              e.modalidad, e.capacidad_max, e.meet_link,
              u.nombre AS creadora_nombre
       FROM eventos_comunidad e
       LEFT JOIN usuarios u ON u.id = e.creadora_id
       WHERE e.comunidad_id = ?
       ORDER BY e.fecha ASC, e.hora ASC`,
      [req.params.id]
    );

    console.log('[eventos] comunidad_id:', req.params.id, '→ rows:', rows.length);
    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener eventos:', err);
    return res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// POST /api/comunidades/:id/eventos
router.post('/', verificarToken, async (req, res) => {
  const { nombre, descripcion, fecha, hora, modalidad, capacidad_max, meet_link } = req.body;

  if (!nombre || !fecha || !hora) {
    return res.status(400).json({ error: 'nombre, fecha y hora son requeridos' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO eventos_comunidad
         (comunidad_id, creadora_id, nombre, descripcion, fecha, hora, modalidad, capacidad_max, meet_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id,
        req.usuario.id,
        nombre,
        descripcion || null,
        fecha,
        hora,
        modalidad || 'virtual',
        capacidad_max || 30,
        meet_link || null,
      ]
    );

    return res.status(201).json({ id: result.insertId, message: 'Evento creado' });
  } catch (err) {
    console.error('Error al crear evento:', err);
    return res.status(500).json({ error: 'Error al crear evento' });
  }
});

// GET /api/comunidades/:id/eventos/agendados
router.get('/agendados', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT evento_id
       FROM inscripciones_evento
       WHERE usuario_id = ? AND comunidad_id = ?`,
      [req.usuario.id, req.params.id]
    );

    return res.json(rows.map((r) => r.evento_id));
  } catch (err) {
    console.error('Error al obtener eventos agendados:', err);
    return res.status(500).json({ error: 'Error al obtener eventos agendados' });
  }
});

// POST /api/comunidades/:id/eventos/:eventoId/inscribir
router.post('/:eventoId/inscribir', verificarToken, async (req, res) => {
  try {
    const comunidadId = req.params.id;
    const eventoId = req.params.eventoId;
    const usuarioId = req.usuario.id;

    const [evento] = await pool.query(
      'SELECT id FROM eventos_comunidad WHERE id = ? AND comunidad_id = ?',
      [eventoId, comunidadId]
    );

    if (evento.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const [existente] = await pool.query(
      `SELECT id FROM inscripciones_evento
       WHERE usuario_id = ? AND evento_id = ?`,
      [usuarioId, eventoId]
    );

    if (existente.length > 0) {
      return res.status(400).json({ error: 'Ya tienes este evento en tu agenda' });
    }

    await pool.query(
      `INSERT INTO inscripciones_evento (usuario_id, evento_id, comunidad_id)
       VALUES (?, ?, ?)`,
      [usuarioId, eventoId, comunidadId]
    );

    return res.status(201).json({ message: 'Evento agendado en tu calendario' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya tienes este evento en tu agenda' });
    }
    console.error('Error al inscribir evento:', err);
    return res.status(500).json({ error: 'Error al agendar evento' });
  }
});

module.exports = router;
