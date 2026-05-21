const express = require('express');
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

// GET /api/eventos
router.get('/', verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;

    const [rows] = await pool.query(
      `SELECT
         e.id,
         e.nombre,
         e.descripcion,
         DATE_FORMAT(e.fecha, '%Y-%m-%d') AS fecha,
         TIME_FORMAT(e.hora, '%H:%i') AS hora,
         e.modalidad,
         e.meet_link,
         c.nombre AS contexto,
         'comunidad' AS tipo
       FROM eventos_comunidad e
       JOIN comunidades c ON c.id = e.comunidad_id
       JOIN miembros_comunidad mc ON mc.comunidad_id = e.comunidad_id
       WHERE mc.usuario_id = ? AND COALESCE(mc.activo, 1) = 1
       UNION ALL
       SELECT
         e.id,
         e.nombre,
         e.descripcion,
         DATE_FORMAT(e.fecha, '%Y-%m-%d') AS fecha,
         TIME_FORMAT(e.hora, '%H:%i') AS hora,
         e.modalidad,
         e.meet_link,
         c.nombre AS contexto,
         'comunidad' AS tipo
       FROM eventos_comunidad e
       JOIN comunidades c ON c.id = e.comunidad_id
       JOIN inscripciones_evento ec ON ec.evento_id = e.id
       WHERE ec.usuario_id = ?
       UNION ALL
       SELECT
         s.id,
         s.asignatura AS nombre,
         s.descripcion_duda AS descripcion,
         DATE_FORMAT(s.fecha_hora, '%Y-%m-%d') AS fecha,
         DATE_FORMAT(s.fecha_hora, '%H:%i') AS hora,
         'virtual' AS modalidad,
         s.meet_link,
         CASE
           WHEN s.mentora_id = ? THEN 'Mentoría (como mentora)'
           ELSE 'Mentoría (como estudiante)'
         END AS contexto,
         'mentoria' AS tipo
       FROM sesiones s
       WHERE s.mentora_id = ? OR s.estudiante_id = ?
       ORDER BY fecha ASC, hora ASC`,
      [userId, userId, userId, userId, userId]
    );

    const seen = new Set();
    const unique = rows.filter((row) => {
      const key = `${row.tipo}-${row.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.json(unique);
  } catch (err) {
    console.error('Error al obtener agenda:', err);
    return res.status(500).json({ error: 'Error al obtener agenda' });
  }
});

module.exports = router;
