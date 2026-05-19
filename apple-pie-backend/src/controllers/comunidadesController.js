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
      materia,
      semestre,
      descripcion,
      tipo = 'estudio',
      modalidad = 'virtual',
      horario = '',
      capacidad_max = 30,
      imagen_portada = null,
    } = req.body;

    const asignaturaFinal = asignatura ?? materia;

    const creadora_id = req.usuario.id;

    const [result] = await pool.query(
      `INSERT INTO comunidades
        (nombre, asignatura, semestre, descripcion, tipo, modalidad, horario, capacidad_max, imagen_portada, creadora_id, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        asignaturaFinal,
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

    const comunidadId = result.insertId;
    try {
      await pool.execute(
        `INSERT INTO miembros_comunidad (comunidad_id, usuario_id, rol, fecha_ingreso, activo)
         VALUES (?, ?, 'creadora', NOW(), 1)`,
        [comunidadId, req.usuario.id]
      );
    } catch (err) {
      console.error('Error al agregar miembro:', err.message, err.sqlMessage);
    }

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

const getMiembrosComunidad = async (req, res) => {
  try {
    const { id } = req.params;

    const [comunidad] = await pool.query(
      'SELECT id FROM comunidades WHERE id = ? AND activa = 1',
      [id]
    );

    if (comunidad.length === 0) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, mc.rol
       FROM miembros_comunidad mc
       JOIN usuarios u ON u.id = mc.usuario_id
       WHERE mc.comunidad_id = ? AND mc.activo = 1`,
      [id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getMiembrosComunidad:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSesionesComunidad = async (req, res) => {
  try {
    const { id } = req.params;

    const [comunidad] = await pool.query(
      'SELECT id FROM comunidades WHERE id = ? AND activa = 1',
      [id]
    );

    if (comunidad.length === 0) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }

    const [columns] = await pool.query('SHOW COLUMNS FROM sesiones');
    const columnNames = new Set(columns.map((c) => c.Field));

    if (!columnNames.has('meet_link')) {
      await pool.query('ALTER TABLE sesiones ADD COLUMN meet_link VARCHAR(255) NULL');
      columnNames.add('meet_link');
    }

    if (!columnNames.has('comunidad_id')) {
      return res.status(200).json([]);
    }

    const joinColumn = columnNames.has('creadora_id')
      ? 'creadora_id'
      : columnNames.has('estudiante_id')
        ? 'estudiante_id'
        : null;
    const orderColumn = columnNames.has('fecha')
      ? 'fecha'
      : columnNames.has('fecha_hora')
        ? 'fecha_hora'
        : 'id';
    const orderBy = columnNames.has('fecha') && columnNames.has('hora')
      ? 's.fecha ASC, s.hora ASC'
      : `s.${orderColumn} ASC`;
    const sql = joinColumn
      ? `SELECT s.*, u.nombre AS creadora_nombre, u.apellido AS creadora_apellido
         FROM sesiones s
         LEFT JOIN usuarios u ON u.id = s.${joinColumn}
         WHERE s.comunidad_id = ?
         ORDER BY ${orderBy}`
      : `SELECT * FROM sesiones WHERE comunidad_id = ? ORDER BY ${orderColumn} ASC`;

    const [rows] = await pool.query(
      sql,
      [id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getSesionesComunidad:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crearSesionComunidad = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      titulo,
      fecha,
      hora,
      modalidad,
      descripcion,
      capacidad_max,
      asignatura,
      duracion_min,
      meet_link,
    } = req.body;
    const creadora_id = req.usuario.id;

    const [comunidad] = await pool.query(
      'SELECT id FROM comunidades WHERE id = ? AND activa = 1',
      [id]
    );

    if (comunidad.length === 0) {
      return res.status(404).json({ error: 'Comunidad no encontrada' });
    }

    const [columns] = await pool.query('SHOW COLUMNS FROM sesiones');
    const columnNames = new Set(columns.map((c) => c.Field));

    if (!columnNames.has('meet_link')) {
      await pool.query('ALTER TABLE sesiones ADD COLUMN meet_link VARCHAR(255) NULL');
      columnNames.add('meet_link');
    }

    const fields = [];
    const placeholders = [];
    const values = [];

    function addField(field, value) {
      if (!columnNames.has(field)) return;
      fields.push(field);
      placeholders.push('?');
      values.push(value);
    }

    const nombreFinal = String(nombre ?? titulo ?? asignatura ?? '').trim();
    if (!nombreFinal) {
      return res.status(400).json({ error: 'El nombre de la sesión es obligatorio' });
    }

    const fechaFinal = fecha ?? new Date().toISOString();
    const horaFinal = hora ?? (
      fechaFinal ? new Date(fechaFinal).toTimeString().slice(0, 5) : '00:00'
    );
    const fechaHoraFinal = fecha && hora ? `${fecha} ${hora}` : fechaFinal;

    addField('comunidad_id', id);
    addField('creadora_id', creadora_id);
    addField('mentora_id', creadora_id);
    addField('estudiante_id', creadora_id);
    addField('nombre', nombreFinal);
    addField('titulo', nombreFinal);
    addField('asignatura', asignatura ?? nombreFinal);
    addField('fecha', fechaFinal);
    addField('hora', horaFinal);
    addField('fecha_hora', fechaHoraFinal);
    addField('modalidad', modalidad ?? 'virtual');
    addField('descripcion', descripcion ?? '');
    addField('descripcion_duda', descripcion ?? nombreFinal);
    addField('capacidad_max', capacidad_max ?? 30);
    addField('duracion_min', duracion_min ?? 60);
    addField('meet_link', meet_link ?? null);
    addField('estado', 'pendiente');

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay columnas compatibles para crear la sesión' });
    }

    const [result] = await pool.query(
      `INSERT INTO sesiones (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
      values
    );

    return res.status(201).json({ id: result.insertId, mensaje: 'Sesión creada' });
  } catch (error) {
    console.error('Error en crearSesionComunidad:', error);
    return res.status(500).json({ error: 'Error al crear sesión' });
  }
};

const salirDeComunidad = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const [miembro] = await pool.query(
      'SELECT comunidad_id FROM miembros_comunidad WHERE comunidad_id = ? AND usuario_id = ? AND activo = 1',
      [id, usuario_id]
    );

    if (miembro.length === 0) {
      return res.status(400).json({ error: 'No eres miembro de esta comunidad' });
    }

    await pool.query(
      'UPDATE miembros_comunidad SET activo = 0 WHERE comunidad_id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    return res.status(200).json({ message: 'Saliste de la comunidad' });
  } catch (err) {
    console.error('Error en salirDeComunidad:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getComunidades,
  getComunidadById,
  getMiembrosComunidad,
  getSesionesComunidad,
  crearSesionComunidad,
  crearComunidad,
  unirseAComunidad,
  salirDeComunidad,
};
