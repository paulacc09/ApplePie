const pool = require('../config/db');

const getComunidades = async (req, res) => {
  try {
    const { asignatura, semestre, tipo } = req.query;

    const conditions = ['activa = 1'];
    const params = [];

    if (asignatura) {
      conditions.push('asignatura = ?');
      params.push(asignatura);
    }
    if (semestre) {
      conditions.push('semestre = ?');
      params.push(semestre);
    }
    if (tipo) {
      conditions.push('tipo = ?');
      params.push(tipo);
    }

    const sql = `SELECT * FROM comunidades WHERE ${conditions.join(' AND ')} ORDER BY id DESC`;
    const [rows] = await pool.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getComunidades:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getComunidadById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM comunidades WHERE id = ? AND activa = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error en getComunidadById:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearComunidad = async (req, res) => {
  try {
    const {
      nombre,
      asignatura,
      semestre,
      descripcion,
      tipo,
      modalidad,
      horario,
      capacidad_max,
      imagen_portada = null,
    } = req.body;

    const creadora_id = req.usuario.id;

    const [result] = await pool.query(
      `INSERT INTO comunidades
        (nombre, asignatura, semestre, descripcion, tipo, modalidad, horario, capacidad_max, imagen_portada, creadora_id, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        asignatura,
        semestre,
        descripcion,
        tipo,
        modalidad,
        horario,
        capacidad_max,
        imagen_portada,
        creadora_id,
      ]
    );

    return res.status(201).json({
      message: 'Comunidad creada',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error en crearComunidad:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const unirseAComunidad = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [comunidad] = await pool.query(
      'SELECT id FROM comunidades WHERE id = ? AND activa = 1',
      [id]
    );

    if (comunidad.length === 0) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }

    const [yaMiembro] = await pool.query(
      'SELECT comunidad_id FROM miembros_comunidad WHERE comunidad_id = ? AND usuario_id = ? AND activo = 1',
      [id, usuario_id]
    );

    if (yaMiembro.length > 0) {
      return res.status(400).json({ error: 'Ya eres miembro de esta comunidad' });
    }

    await pool.query(
      `INSERT INTO miembros_comunidad (comunidad_id, usuario_id, rol, fecha_ingreso, activo)
       VALUES (?, ?, 'miembro', NOW(), 1)
       ON DUPLICATE KEY UPDATE activo = 1, fecha_ingreso = NOW()`,
      [id, usuario_id]
    );

    return res.status(201).json({ message: 'Te has unido a la comunidad' });
  } catch (err) {
    console.error('Error en unirseAComunidad:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getComunidades,
  getComunidadById,
  crearComunidad,
  unirseAComunidad,
};
