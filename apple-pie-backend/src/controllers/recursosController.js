const pool = require('../config/db');
const { cloudinary } = require('../utils/cloudinary');

const subirRecurso = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const {
      nombre,
      asignatura,
      semestre,
      tipo,
      visibilidad = 'publica',
      comunidad_id = null,
    } = req.body;

    const subido_por = req.usuario.id;
    const archivo_url = req.file.path;
    const archivo_public_id = req.file.filename;
    const tamano_kb = Math.round(req.file.size / 1024);

    const [result] = await pool.query(
      `INSERT INTO recursos
        (nombre, asignatura, semestre, tipo, archivo_url, archivo_public_id,
         tamano_kb, subido_por, comunidad_id, visibilidad, descargas, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
      [
        nombre,
        asignatura,
        semestre,
        tipo,
        archivo_url,
        archivo_public_id,
        tamano_kb,
        subido_por,
        comunidad_id,
        visibilidad,
      ]
    );

    return res.status(201).json({
      message: 'Recurso subido',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error en subirRecurso:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getRecursos = async (req, res) => {
  try {
    const { asignatura, semestre, tipo, visibilidad } = req.query;

    const conditions = ['activo = 1'];
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
    if (visibilidad) {
      conditions.push('visibilidad = ?');
      params.push(visibilidad);
    }

    const sql = `SELECT * FROM recursos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
    const [rows] = await pool.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getRecursos:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getRecursoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM recursos WHERE id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error en getRecursoById:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarRecurso = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT subido_por, archivo_public_id FROM recursos WHERE id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }

    const recurso = rows[0];

    const esDueno = req.usuario.id === recurso.subido_por;
    const esAdmin = req.usuario.rol === 'admin';

    if (!esDueno && !esAdmin) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este recurso' });
    }

    const isRaw = recurso.archivo_url.includes('/raw/upload/');
    await cloudinary.uploader.destroy(recurso.archivo_public_id, {
      resource_type: isRaw ? 'raw' : 'image',
    });

    await pool.query('UPDATE recursos SET activo = 0 WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Recurso eliminado' });
  } catch (err) {
    console.error('Error en eliminarRecurso:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  subirRecurso,
  getRecursos,
  getRecursoById,
  eliminarRecurso,
};
