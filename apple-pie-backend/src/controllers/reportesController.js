const db = require('../config/db');

const TIPOS_OBJETIVO = new Set([
  'publicacion',
  'respuesta',
  'recurso',
  'perfil',
  'comunidad',
]);

const ACCIONES_VALIDAS = new Set([
  'eliminado',
  'advertencia',
  'suspension',
  'cuenta_suspendida',
]);

const crearReporte = async (req, res) => {
  try {
    const reportado_por = req.usuario.id;
    const { tipo_objetivo, objetivo_id, motivo, descripcion } = req.body;

    if (!TIPOS_OBJETIVO.has(tipo_objetivo)) {
      return res.status(400).json({ error: 'tipo_objetivo inválido' });
    }

    if (motivo == null || String(motivo).trim() === '') {
      return res.status(400).json({ error: 'El motivo es obligatorio' });
    }

    const [result] = await db.query(
      `INSERT INTO reportes_contenido
        (reportado_por, tipo_objetivo, objetivo_id, motivo, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [reportado_por, tipo_objetivo, objetivo_id, String(motivo).trim(), descripcion ?? null]
    );

    const [rows] = await db.query('SELECT * FROM reportes_contenido WHERE id = ?', [
      result.insertId,
    ]);
    const reporte = rows[0];

    return res.status(201).json({
      message: 'Reporte enviado',
      reporte,
    });
  } catch (err) {
    console.error('Error en crearReporte:', err);
    return res.status(500).json({ error: err.message });
  }
};

const listarReportes = async (req, res) => {
  try {
    const { estado, urgente } = req.query;

    const conditions = [];
    const params = [];

    if (estado !== undefined && estado !== '') {
      conditions.push('estado = ?');
      params.push(estado);
    }

    if (urgente === '1') {
      conditions.push('urgente = 1');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM reportes_contenido ${whereClause} ORDER BY urgente DESC, created_at ASC`;

    const [rows] = await db.query(sql, params);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en listarReportes:', err);
    return res.status(500).json({ error: err.message });
  }
};

const resolverReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, accion_tomada, notas_moderacion } = req.body;

    if (estado !== 'resuelto' && estado !== 'desestimado') {
      return res.status(400).json({ error: 'estado debe ser resuelto o desestimado' });
    }

    let accionFinal = null;

    if (estado === 'resuelto') {
      if (accion_tomada == null || accion_tomada === '') {
        return res.status(400).json({
          error: 'accion_tomada es obligatoria cuando estado es resuelto',
        });
      }
      if (!ACCIONES_VALIDAS.has(accion_tomada)) {
        return res.status(400).json({ error: 'accion_tomada inválida' });
      }
      accionFinal = accion_tomada;
    }

    const notas = notas_moderacion === undefined ? null : notas_moderacion;
    const moderadora_id = req.usuario.id;

    const [updateResult] = await db.query(
      `UPDATE reportes_contenido SET
        estado = ?,
        accion_tomada = ?,
        notas_moderacion = ?,
        moderadora_id = ?,
        fecha_resolucion = NOW()
      WHERE id = ?`,
      [estado, accionFinal, notas, moderadora_id, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    return res.status(200).json({ message: 'Reporte resuelto' });
  } catch (err) {
    console.error('Error en resolverReporte:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crearReporte,
  listarReportes,
  resolverReporte,
};
