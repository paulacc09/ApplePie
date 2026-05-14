const pool = require('../config/db');
const { enviarConfirmacionSesion } = require('../services/emailService');

const crearSesion = async (req, res) => {
  try {
    const estudiante_id = req.usuario.id;
    const {
      mentora_id,
      tarifa_id,
      curso_id,
      asignatura,
      descripcion_duda,
      fecha_hora,
      duracion_min,
    } = req.body;
    const estado = 'pendiente';

    const [result] = await pool.query(
      `INSERT INTO sesiones
        (mentora_id, estudiante_id, tarifa_id, curso_id, asignatura, descripcion_duda,
         fecha_hora, duracion_min, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mentora_id,
        estudiante_id,
        tarifa_id,
        curso_id,
        asignatura,
        descripcion_duda,
        fecha_hora,
        duracion_min,
        estado,
      ]
    );

    return res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Error en crearSesion:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSesionesMentora = async (req, res) => {
  try {
    const mentora_id = req.usuario.id;
    const { estado } = req.query;

    const conditions = ['mentora_id = ?'];
    const params = [mentora_id];

    if (estado !== undefined && estado !== '') {
      conditions.push('estado = ?');
      params.push(estado);
    }

    const sql = `SELECT * FROM sesiones WHERE ${conditions.join(' AND ')} ORDER BY fecha_hora DESC`;
    const [rows] = await pool.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getSesionesMentora:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSesionesEstudiante = async (req, res) => {
  try {
    const estudiante_id = req.usuario.id;
    const { estado } = req.query;

    const conditions = ['estudiante_id = ?'];
    const params = [estudiante_id];

    if (estado !== undefined && estado !== '') {
      conditions.push('estado = ?');
      params.push(estado);
    }

    const sql = `SELECT * FROM sesiones WHERE ${conditions.join(' AND ')} ORDER BY fecha_hora DESC`;
    const [rows] = await pool.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getSesionesEstudiante:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedKeys = ['estado', 'enlace_sesion', 'notas_mentora'];

    const [rows] = await pool.query(
      'SELECT mentora_id FROM sesiones WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    if (rows[0].mentora_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo la mentora puede actualizar esta sesión' });
    }

    const updates = [];
    const values = [];

    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    values.push(id);
    await pool.query(
      `UPDATE sesiones SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    const estado = req.body.estado;
    if (estado === 'confirmada') {
      const [sesionData] = await pool.query(
        `SELECT s.fecha_hora, s.asignatura, s.enlace_sesion,
            ue.email AS estudianteEmail, ue.nombre AS estudianteNombre,
            um.nombre AS mentoraNombre
     FROM sesiones s
     JOIN usuarios ue ON ue.id = s.estudiante_id
     JOIN usuarios um ON um.id = s.mentora_id
     WHERE s.id = ?`,
        [req.params.id]
      );
      if (sesionData.length > 0) {
        const s = sesionData[0];
        enviarConfirmacionSesion({
          toEmail: s.estudianteEmail,
          toNombre: s.estudianteNombre,
          mentoraNombre: s.mentoraNombre,
          fecha_hora: s.fecha_hora,
          asignatura: s.asignatura,
          enlace_sesion: s.enlace_sesion,
        });
      }
    }

    return res.status(200).json({ message: 'Sesión actualizada' });
  } catch (err) {
    console.error('Error en actualizarSesion:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const valorarSesion = async (req, res) => {
  try {
    const sesion_id = req.params.id;
    const estudiante_id = req.usuario.id;
    const { puntuacion, comentario } = req.body;

    const p = Number(puntuacion);
    if (!Number.isInteger(p) || p < 1 || p > 5) {
      return res.status(400).json({ error: 'La puntuación debe ser un entero entre 1 y 5' });
    }

    const [sesiones] = await pool.query(
      'SELECT id, mentora_id, estudiante_id FROM sesiones WHERE id = ?',
      [sesion_id]
    );

    if (sesiones.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    const sesion = sesiones[0];

    if (sesion.estudiante_id !== estudiante_id) {
      return res.status(403).json({ error: 'No puedes valorar esta sesión' });
    }

    const [existente] = await pool.query(
      'SELECT id FROM valoraciones WHERE sesion_id = ?',
      [sesion_id]
    );

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Esta sesión ya fue valorada' });
    }

    await pool.query(
      `INSERT INTO valoraciones (sesion_id, estudiante_id, mentora_id, puntuacion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [sesion_id, estudiante_id, sesion.mentora_id, p, comentario]
    );

    await pool.query(
      `UPDATE perfiles_mentora SET calificacion = (
        SELECT AVG(puntuacion) FROM valoraciones WHERE mentora_id = ?
      ) WHERE usuario_id = ?`,
      [sesion.mentora_id, sesion.mentora_id]
    );

    return res.status(201).json({ message: 'Valoración registrada' });
  } catch (err) {
    console.error('Error en valorarSesion:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getSesionById = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.usuario.id;

    const [rows] = await pool.query('SELECT * FROM sesiones WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    const sesion = rows[0];
    const esParticipante =
      sesion.mentora_id === uid || sesion.estudiante_id === uid;

    if (!esParticipante) {
      return res.status(403).json({ error: 'No tienes acceso a esta sesión' });
    }

    return res.status(200).json(sesion);
  } catch (err) {
    console.error('Error en getSesionById:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearSesion,
  getSesionesMentora,
  getSesionesEstudiante,
  actualizarSesion,
  valorarSesion,
  getSesionById,
};
