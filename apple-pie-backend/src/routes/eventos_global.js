const express = require('express');
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

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
         s.id,
         s.asignatura AS nombre,
         s.descripcion_duda AS descripcion,
         DATE_FORMAT(s.fecha_hora, '%Y-%m-%d') AS fecha,
         DATE_FORMAT(s.fecha_hora, '%H:%i') AS hora,
         'virtual' AS modalidad,
         s.enlace_sesion AS meet_link,
         CASE
           WHEN s.mentora_id = ? THEN 'Mentoría (como mentora)'
           ELSE 'Mentoría (como estudiante)'
         END AS contexto,
         'mentoria' AS tipo
       FROM sesiones s
       WHERE s.mentora_id = ? OR s.estudiante_id = ?
       ORDER BY fecha ASC, hora ASC`,
      [userId, userId, userId, userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener agenda:', err);
    return res.status(500).json({ error: 'Error al obtener agenda' });
  }
});

module.exports = router;
