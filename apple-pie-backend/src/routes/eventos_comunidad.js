const express = require('express');
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router({ mergeParams: true });

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

// GET /api/comunidades/:id/eventos
router.get('/', verificarToken, async (req, res) => {
  try {
    await ensureEventosComunidadTable();

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
    await ensureEventosComunidadTable();

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

module.exports = router;
