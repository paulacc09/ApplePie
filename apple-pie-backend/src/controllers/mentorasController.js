const pool = require('../config/db');

const postularse = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { bio_mentora, bio, experiencia, especialidades, logros } = req.body;
    const bioMentora = bio_mentora ?? bio;

    if (!bioMentora || !experiencia || !especialidades) {
      return res.status(400).json({ error: 'Bio, experiencia y especialidades son obligatorias' });
    }

    const [existente] = await pool.query(
      'SELECT id, activa FROM perfiles_mentora WHERE usuario_id = ? ORDER BY id DESC LIMIT 1',
      [usuario_id]
    );

    if (existente.length > 0 && existente[0].activa === 1) {
      return res.status(400).json({ error: 'Ya tienes un perfil de mentora activo' });
    }

    if (existente.length > 0) {
      await pool.query(
        `UPDATE perfiles_mentora
         SET bio_mentora = ?, experiencia = ?, especialidades = ?, logros = ?, activa = 0, updated_at = NOW()
         WHERE id = ?`,
        [bioMentora, experiencia, especialidades, logros ?? null, existente[0].id]
      );

      return res.status(200).json({
        id: existente[0].id,
        message: 'Postulación actualizada y enviada para aprobación',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO perfiles_mentora
        (usuario_id, bio_mentora, experiencia, especialidades, logros, calificacion, total_sesiones, activa)
       VALUES (?, ?, ?, ?, ?, 0.00, 0, 0)`,
      [usuario_id, bioMentora, experiencia, especialidades, logros ?? null]
    );

    return res.status(201).json({
      id: result.insertId,
      message: 'Postulación enviada para aprobación',
    });
  } catch (err) {
    console.error('Error en postularse:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMentoras = async (req, res) => {
  try {
    const { carrera } = req.query;
    const params = [];
    let carreraFilter = '';

    if (carrera !== undefined && carrera !== '') {
      carreraFilter = ' AND u.programa = ?';
      params.push(carrera);
    }

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
         u.programa AS carrera,
         u.foto_perfil
       FROM usuarios u
       LEFT JOIN perfiles_mentora pm ON pm.usuario_id = u.id AND pm.activa = 1
       WHERE u.rol = 'mentora'${carreraFilter}
       ORDER BY COALESCE(pm.calificacion, 0) DESC, u.nombre ASC`,
      params
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
         pm.disponibilidad,
         pm.calificacion,
         pm.total_sesiones,
         pm.activa,
         u.nombre,
         u.apellido,
         u.email,
         u.semestre,
         u.universidad,
         u.programa,
         u.bio,
         u.foto_perfil,
         pm.bio_mentora AS descripcion
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
    const {
      nombre,
      asignaturas,
      semestre,
      descripcion,
      disponibilidad,
      bio_mentora,
      experiencia,
      especialidades,
      logros,
    } = req.body;

    const [rows] = await pool.query(
      `SELECT pm.id AS perfil_id, pm.usuario_id, pm.experiencia, pm.logros
       FROM usuarios u
       LEFT JOIN perfiles_mentora pm ON pm.usuario_id = u.id AND pm.activa = 1
       WHERE u.rol = 'mentora' AND (u.id = ? OR pm.id = ?)
       LIMIT 1`,
      [id, id]
    );

    if (rows.length === 0 || !rows[0].perfil_id) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    if (rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
    }

    const perfilId = rows[0].perfil_id;
    const usuarioId = rows[0].usuario_id;
    const descFinal = descripcion ?? bio_mentora;
    const espFinal = asignaturas ?? especialidades;

    let disponibilidadValue = disponibilidad;
    if (disponibilidad !== undefined && disponibilidad !== null && typeof disponibilidad !== 'string') {
      disponibilidadValue = JSON.stringify(disponibilidad);
    }

    if (nombre !== undefined || semestre !== undefined) {
      await pool.query(
        `UPDATE usuarios
         SET nombre = COALESCE(?, nombre),
             semestre = COALESCE(?, semestre),
             updated_at = NOW()
         WHERE id = ?`,
        [nombre ?? null, semestre ?? null, usuarioId]
      );
    }

    await pool.query(
      `UPDATE perfiles_mentora
       SET bio_mentora = COALESCE(?, bio_mentora),
           experiencia = COALESCE(?, experiencia),
           especialidades = COALESCE(?, especialidades),
           logros = COALESCE(?, logros),
           disponibilidad = COALESCE(?, disponibilidad),
           updated_at = NOW()
       WHERE id = ?`,
      [
        descFinal ?? null,
        experiencia ?? rows[0].experiencia ?? null,
        espFinal ?? null,
        logros ?? rows[0].logros ?? null,
        disponibilidadValue ?? null,
        perfilId,
      ]
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
