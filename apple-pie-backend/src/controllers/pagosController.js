const db = require('../config/db');

const TIPOS_VALIDOS = new Set(['suscripcion', 'sesion', 'recurso_exclusivo']);
const METODOS_VALIDOS = new Set(['tarjeta', 'pse', 'nequi', 'bancolombia', 'transferencia']);
const ESTADOS_ACTUALIZACION = new Set(['completado', 'fallido', 'reembolsado']);

const registrarPago = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { tipo, referencia_id, monto, metodo, transaccion_id, descripcion } = req.body;

    if (!TIPOS_VALIDOS.has(tipo)) {
      return res.status(400).json({ error: 'Tipo de pago inválido' });
    }
    if (!METODOS_VALIDOS.has(metodo)) {
      return res.status(400).json({ error: 'Método de pago inválido' });
    }

    const [result] = await db.query(
      `INSERT INTO pagos
        (usuario_id, tipo, referencia_id, monto, metodo, estado, transaccion_id, descripcion)
       VALUES (?, ?, ?, ?, ?, 'pendiente', ?, ?)`,
      [usuario_id, tipo, referencia_id ?? null, monto, metodo, transaccion_id ?? null, descripcion ?? null]
    );

    const [rows] = await db.query('SELECT * FROM pagos WHERE id = ?', [result.insertId]);
    const pago = rows[0];

    return res.status(201).json({
      message: 'Pago registrado',
      pago,
    });
  } catch (err) {
    console.error('Error en registrarPago:', err);
    return res.status(500).json({ error: err.message });
  }
};

const historialPagos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [rows] = await db.query(
      'SELECT * FROM pagos WHERE usuario_id = ? ORDER BY created_at DESC',
      [usuario_id]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en historialPagos:', err);
    return res.status(500).json({ error: err.message });
  }
};

const actualizarEstadoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!ESTADOS_ACTUALIZACION.has(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Debe ser completado, fallido o reembolsado',
      });
    }

    const [updateResult] = await db.query('UPDATE pagos SET estado = ? WHERE id = ?', [estado, id]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    return res.status(200).json({ message: 'Estado actualizado' });
  } catch (err) {
    console.error('Error en actualizarEstadoPago:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registrarPago,
  historialPagos,
  actualizarEstadoPago,
};
