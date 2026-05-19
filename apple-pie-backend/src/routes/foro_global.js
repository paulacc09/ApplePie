const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('../middleware/verificarToken');

// GET /api/foro
router.get('/', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        p.id,
        p.contenido,
        p.me_gusta,
        p.created_at,
        u.nombre,
        u.apellido
      FROM publicaciones_foro p
      JOIN usuarios u ON p.autora_id = u.id
      WHERE p.comunidad_id IS NULL AND p.activa = 1
      ORDER BY p.created_at DESC
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

// POST /api/foro/:id/me-gusta
router.post('/:id/me-gusta', verificarToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE publicaciones_foro SET me_gusta = me_gusta + 1
       WHERE id = ? AND comunidad_id IS NULL AND activa = 1`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    return res.json({ mensaje: 'Me gusta registrado' });
  } catch (error) {
    console.error('[foro_global] ME GUSTA error:', error);
    return res.status(500).json({ error: 'Error al registrar me gusta' });
  }
});

// GET /api/foro/:id/respuestas
router.get('/:id/respuestas', async (req, res) => {
  try {
    const [respuestas] = await pool.query(
      `SELECT
         r.id,
         r.contenido,
         r.created_at,
         u.nombre,
         u.apellido
       FROM respuestas_foro r
       JOIN usuarios u ON r.autora_id = u.id
       WHERE r.publicacion_id = ?
       ORDER BY r.created_at ASC`,
      [req.params.id]
    );

    return res.json(respuestas);
  } catch (error) {
    console.error('[foro_global] GET respuestas error:', error);
    return res.status(500).json({ error: 'Error al obtener respuestas' });
  }
});

// POST /api/foro/:id/respuestas
router.post('/:id/respuestas', verificarToken, async (req, res) => {
  const { contenido } = req.body;
  const autora_id = req.usuario.id;

  if (!contenido || !contenido.trim()) {
    return res.status(400).json({ error: 'El contenido no puede estar vacío' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO respuestas_foro (publicacion_id, autora_id, contenido)
       VALUES (?, ?, ?)`,
      [req.params.id, autora_id, contenido.trim()]
    );

    return res.status(201).json({ id: result.insertId, mensaje: 'Respuesta creada' });
  } catch (error) {
    console.error('[foro_global] POST respuesta error:', error);
    return res.status(500).json({ error: 'Error al crear respuesta' });
  }
});

module.exports = router;