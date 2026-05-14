const pool = require('../config/db');

const getPublicaciones = async (req, res) => {
  try {
    const { comunidadId } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM publicaciones_foro WHERE comunidad_id = ? AND activa = 1 ORDER BY created_at DESC',
      [comunidadId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getPublicaciones:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearPublicacion = async (req, res) => {
  try {
    const { comunidadId } = req.params;
    const { contenido, archivo_url = null } = req.body;
    const autora_id = req.usuario.id;

    const [result] = await pool.query(
      `INSERT INTO publicaciones_foro
        (comunidad_id, autora_id, contenido, archivo_url, me_gusta, activa)
       VALUES (?, ?, ?, ?, 0, 1)`,
      [comunidadId, autora_id, contenido, archivo_url]
    );

    return res.status(201).json({
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error en crearPublicacion:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT autora_id FROM publicaciones_foro WHERE id = ? AND activa = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const publicacion = rows[0];
    const esAutora = req.usuario.id === publicacion.autora_id;
    const esAdmin = req.usuario.rol === 'admin';

    if (!esAutora && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta publicación' });
    }

    await pool.query('UPDATE publicaciones_foro SET activa = 0 WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Publicación eliminada' });
  } catch (err) {
    console.error('Error en eliminarPublicacion:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getRespuestas = async (req, res) => {
  try {
    const { publicacionId } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM respuestas_foro WHERE publicacion_id = ? AND activa = 1 ORDER BY created_at ASC',
      [publicacionId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getRespuestas:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearRespuesta = async (req, res) => {
  try {
    const { publicacionId } = req.params;
    const { contenido } = req.body;
    const autora_id = req.usuario.id;

    const [result] = await pool.query(
      `INSERT INTO respuestas_foro
        (publicacion_id, autora_id, contenido, me_gusta, activa)
       VALUES (?, ?, ?, 0, 1)`,
      [publicacionId, autora_id, contenido]
    );

    return res.status(201).json({
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error en crearRespuesta:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarRespuesta = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT autora_id FROM respuestas_foro WHERE id = ? AND activa = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Respuesta no encontrada' });
    }

    const respuesta = rows[0];
    const esAutora = req.usuario.id === respuesta.autora_id;
    const esAdmin = req.usuario.rol === 'admin';

    if (!esAutora && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta respuesta' });
    }

    await pool.query('UPDATE respuestas_foro SET activa = 0 WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Respuesta eliminada' });
  } catch (err) {
    console.error('Error en eliminarRespuesta:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPublicaciones,
  crearPublicacion,
  eliminarPublicacion,
  getRespuestas,
  crearRespuesta,
  eliminarRespuesta,
};
