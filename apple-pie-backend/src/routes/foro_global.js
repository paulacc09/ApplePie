const express = require('express');
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

// GET /api/foro — obtener todas las publicaciones globales
router.get('/', verificarToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.contenido,
         p.created_at,
         p.archivo_url,
         u.nombre AS autor_nombre,
         u.apellido AS autor_apellido
       FROM publicaciones_foro p
       JOIN usuarios u ON u.id = p.autora_id
       WHERE p.comunidad_id IS NULL AND COALESCE(p.activa, 1) = 1
       ORDER BY p.created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error('[foro_global] GET error:', err);
    return res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// POST /api/foro — crear publicación global
router.post('/', verificarToken, async (req, res) => {
  const { contenido } = req.body;

  if (!contenido || !contenido.trim()) {
    return res.status(400).json({ error: 'El contenido es requerido' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO publicaciones_foro (autora_id, contenido, comunidad_id, me_gusta, activa)
       VALUES (?, ?, NULL, 0, 1)`,
      [req.usuario.id, contenido.trim()]
    );

    return res.status(201).json({ id: result.insertId, message: 'Publicación creada' });
  } catch (err) {
    console.error('[foro_global] POST error:', err);
    return res.status(500).json({ error: 'Error al crear publicación' });
  }
});

module.exports = router;
