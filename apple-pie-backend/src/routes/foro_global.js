const express = require('express');
const router = express.Router();
const pool = require('../db');
const verificarToken = require('../middleware/verificarToken');

// GET /api/foro
router.get('/', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        p.id,
        p.contenido,
        p.me_gusta,
        p.creado_en,
        u.nombre,
        u.apellido
      FROM publicaciones_foro p
      JOIN usuarios u ON p.autora_id = u.id
      WHERE p.comunidad_id IS NULL AND p.activa = 1
      ORDER BY p.creado_en DESC
    `);
    return res.json(posts);
  } catch (error) {
    console.error('[foro_global] GET error:', error);
    return res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// POST /api/foro
router.post('/', verificarToken, async (req, res) => {
  const { contenido } = req.body;
  const autora_id = req.usuario.id;

  if (!contenido || !contenido.trim()) {
    return res.status(400).json({ error: 'El contenido no puede estar vacío' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO publicaciones_foro (autora_id, contenido, comunidad_id, me_gusta, activa)
       VALUES (?, ?, NULL, 0, 1)`,
      [autora_id, contenido.trim()]
    );
    return res.status(201).json({ id: result.insertId, mensaje: 'Publicación creada' });
  } catch (error) {
    console.error('[foro_global] POST error:', error);
    return res.status(500).json({ error: 'Error al crear la publicación' });
  }
});

module.exports = router;