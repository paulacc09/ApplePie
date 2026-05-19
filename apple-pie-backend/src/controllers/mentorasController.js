const pool = require('../config/db');

const postularse = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { bio_mentora, experiencia, especialidades, logros } = req.body;

    const [existente] = await pool.query(
      'SELECT id FROM perfiles_mentora WHERE usuario_id = ? AND activa = 1',
      [usuario_id]
    );

    if (existente.length > 0) {
      return res.status(400).json({ error: 'Ya tienes un perfil de mentora' });
    }

    const [result] = await pool.query(
      `INSERT INTO perfiles_mentora
        (usuario_id, bio_mentora, experiencia, especialidades, logros, calificacion, total_sesiones, activa)
       VALUES (?, ?, ?, ?, ?, 0.00, 0, 1)`,
      [usuario_id, bio_mentora, experiencia, especialidades, logros]
    );

    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error en postularse:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMentoras = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id AS id,
         pm.id AS perfil_id,
         u.id AS usuario_id,
         pm.bio_mentora,
         pm.experiencia,
         pm.especialidades,
         pm.logros,
         pm.calificacion,
         pm.total_sesiones,
         pm.activa,
         u.nombre,
         u.foto_perfil
       FROM usuarios u
       LEFT JOIN perfiles_mentora pm ON pm.usuario_id = u.id AND pm.activa = 1
       WHERE u.rol = 'mentora'
       ORDER BY COALESCE(pm.calificacion, 0) DESC, u.nombre ASC`
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getMentoras:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMentoraById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
         u.id AS id,
         pm.id AS perfil_id,
         u.id AS usuario_id,
         pm.bio_mentora,
         pm.experiencia,
         pm.especialidades,
         pm.logros,
         pm.calificacion,
         pm.total_sesiones,
         pm.activa,
         u.nombre,
         u.apellido,
         u.email,
         u.universidad,
         u.programa,
         u.bio,
         u.foto_perfil
       FROM usuarios u
       LEFT JOIN perfiles_mentora pm ON pm.usuario_id = u.id AND pm.activa = 1
       WHERE u.rol = 'mentora' AND (u.id = ? OR pm.id = ?)
       LIMIT 1`,
      [id, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mentora no encontrada' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error en getMentoraById:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio_mentora, experiencia, especialidades, logros } = req.body;

    const [rows] = await pool.query(
      'SELECT usuario_id FROM perfiles_mentora WHERE id = ? AND activa = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    if (rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
    }

    await pool.query(
      `UPDATE perfiles_mentora
       SET bio_mentora = ?, experiencia = ?, especialidades = ?, logros = ?, updated_at = NOW()
       WHERE id = ?`,
      [bio_mentora, experiencia, especialidades, logros, id]
    );

    return res.status(200).json({ message: 'Perfil actualizado' });
  } catch (err) {
    console.error('Error en actualizarPerfil:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  postularse,
  getMentoras,
  getMentoraById,
  actualizarPerfil,
};
