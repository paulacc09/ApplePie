const db = require('../config/db');
const { subirACloudinary } = require('../utils/cloudinary');

const CAMPOS_PERFIL = [
  'nombre',
  'apellido',
  'universidad',
  'programa',
  'semestre',
  'bio',
];

const SELECT_PERFIL = `SELECT id, nombre, apellido, email, universidad, programa, semestre,
  foto_perfil, bio, rol, activo, email_verificado, created_at`;

const obtenerPerfil = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [rows] = await db.query(`${SELECT_PERFIL} FROM usuarios WHERE id = ?`, [usuario_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error en obtenerPerfil:', err);
    return res.status(500).json({ error: err.message });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const updates = [];
    const values = [];

    for (const key of CAMPOS_PERFIL) {
      if (!Object.prototype.hasOwnProperty.call(req.body, key)) continue;
      const val = req.body[key];
      if (val === undefined) continue;
      if (typeof val === 'string' && val.trim() === '') continue;
      updates.push(`${key} = ?`);
      values.push(typeof val === 'string' ? val.trim() : val);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(usuario_id);
    await db.query(
      `UPDATE usuarios SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    const [rows] = await db.query(`${SELECT_PERFIL} FROM usuarios WHERE id = ?`, [usuario_id]);

    return res.status(200).json({
      message: 'Perfil actualizado',
      usuario: rows[0],
    });
  } catch (err) {
    console.error('Error en actualizarPerfil:', err);
    return res.status(500).json({ error: err.message });
  }
};

const actualizarFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen' });
    }

    const usuario_id = req.usuario.id;

    const url = await subirACloudinary(req.file.buffer, {
      folder: 'apple-pie/perfiles',
      public_id: `perfil_${usuario_id}`,
      overwrite: true,
      resource_type: 'image',
    });

    await db.query('UPDATE usuarios SET foto_perfil = ?, updated_at = NOW() WHERE id = ?', [
      url,
      usuario_id,
    ]);

    return res.status(200).json({
      message: 'Foto actualizada',
      foto_perfil: url,
    });
  } catch (err) {
    console.error('Error en actualizarFoto:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarFoto,
};
