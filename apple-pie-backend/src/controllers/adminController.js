const db = require('../config/db');

const ROLES_VALIDOS = new Set(['estudiante', 'mentora', 'admin']);

const listarUsuarios = async (req, res) => {
  try {
    const { rol, activo, buscar } = req.query;

    const conditions = [];
    const params = [];

    if (rol !== undefined && rol !== '') {
      conditions.push('rol = ?');
      params.push(rol);
    }

    if (activo !== undefined && activo !== '') {
      if (activo !== '0' && activo !== '1' && activo !== 0 && activo !== 1) {
        return res.status(400).json({ error: 'activo debe ser 0 o 1' });
      }
      conditions.push('activo = ?');
      params.push(Number(activo));
    }

    if (buscar !== undefined && buscar !== '') {
      const like = `%${buscar}%`;
      conditions.push('(nombre LIKE ? OR email LIKE ?)');
      params.push(like, like);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, nombre, email, rol, activo, created_at FROM usuarios ${whereClause} ORDER BY created_at DESC`;

    const [rows] = await db.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en listarUsuarios:', err);
    return res.status(500).json({ error: err.message });
  }
};

const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const targetId = parseInt(id, 10);
    const uid = Number(req.usuario.id);

    if (uid === targetId) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
    }

    if (!ROLES_VALIDOS.has(rol)) {
      return res.status(400).json({ error: 'rol inválido' });
    }

    const [updateResult] = await db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Rol actualizado' });
  } catch (err) {
    console.error('Error en cambiarRol:', err);
    return res.status(500).json({ error: err.message });
  }
};

const cambiarActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    const targetId = parseInt(id, 10);
    const uid = Number(req.usuario.id);

    if (uid === targetId) {
      return res.status(400).json({ error: 'No puedes suspender tu propia cuenta' });
    }

    const n = Number(activo);
    if (activo === undefined || (n !== 0 && n !== 1)) {
      return res.status(400).json({ error: 'activo debe ser 0 o 1' });
    }

    const [updateResult] = await db.query('UPDATE usuarios SET activo = ? WHERE id = ?', [n, id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const message = n === 1 ? 'Usuario activado' : 'Usuario suspendido';

    return res.status(200).json({ message });
  } catch (err) {
    console.error('Error en cambiarActivo:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  listarUsuarios,
  cambiarRol,
  cambiarActivo,
};
