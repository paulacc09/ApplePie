const express = require('express');
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

async function ensureEventosCalendarioTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS eventos_calendario (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      evento_id INT NOT NULL,
      comunidad_id INT NOT NULL,
      tipo VARCHAR(50) NOT NULL DEFAULT 'evento_comunidad',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_usuario_evento_tipo (usuario_id, evento_id, tipo)
    )
  `);
}

async function ensureEventosComunidadTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS eventos_comunidad (
      id INT AUTO_INCREMENT PRIMARY KEY,
      comunidad_id INT NOT NULL,
      creadora_id INT NOT NULL,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT NULL,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      modalidad VARCHAR(50) NOT NULL DEFAULT 'virtual',
      capacidad_max INT NOT NULL DEFAULT 30,
      meet_link VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_eventos_comunidad_fecha (comunidad_id, fecha, hora)
    )
  `);
}

// GET /api/eventos
router.get('/', verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    await ensureEventosComunidadTable();
    await ensureEventosCalendarioTable();

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
       JOIN eventos_calendario ec ON ec.evento_id = e.id AND ec.tipo = 'evento_comunidad'
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
