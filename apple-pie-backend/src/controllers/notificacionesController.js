const db = require('../config/db');

const obtenerNotificaciones = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { leida } = req.query;

    const conditions = ['usuario_id = ?'];
    const params = [usuario_id];

    if (leida !== undefined && leida !== '') {
      if (leida !== '0' && leida !== '1' && leida !== 0 && leida !== 1) {
        return res.status(400).json({ error: 'leida debe ser 0 o 1' });
      }
      conditions.push('leida = ?');
      params.push(Number(leida));
    }

    const sql = `SELECT id, tipo, titulo, mensaje, leida, referencia_tipo, referencia_id, created_at
      FROM notificaciones WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;

    const [rows] = await db.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en obtenerNotificaciones:', err);
    return res.status(500).json({ error: err.message });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [result] = await db.query(
      'UPDATE notificaciones SET leida = 1 WHERE usuario_id = ? AND leida = 0',
      [usuario_id]
    );

    return res.status(200).json({
      message: 'Notificaciones marcadas como leídas',
      actualizadas: result.affectedRows,
    });
  } catch (err) {
    console.error('Error en marcarTodasLeidas:', err);
    return res.status(500).json({ error: err.message });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { id } = req.params;

    const [result] = await db.query(
      'UPDATE notificaciones SET leida = 1 WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    return res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    console.error('Error en marcarLeida:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  obtenerNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
};
