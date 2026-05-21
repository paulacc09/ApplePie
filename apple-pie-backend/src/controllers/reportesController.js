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
    let { estado, urgente } = req.query;

    if (estado === 'activo') estado = 'pendiente';

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

const getModerationStats = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS reportes_pendientes,
         COUNT(CASE WHEN estado = 'resuelto' AND MONTH(fecha_resolucion) = MONTH(NOW()) THEN 1 END) AS resueltos_mes,
         COUNT(CASE WHEN accion_tomada = 'advertencia' THEN 1 END) AS advertencias_emitidas
       FROM reportes_contenido`
    );

    return res.status(200).json(rows[0] ?? {});
  } catch (err) {
    console.error('Error en getModerationStats:', err);
    return res.status(500).json({ error: err.message });
  }
};

const getHistorial = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         rc.id,
         rc.fecha_resolucion AS fecha,
         rc.motivo AS reporte,
         rc.accion_tomada,
         rc.estado,
         CONCAT(u.nombre, ' ', COALESCE(u.apellido, '')) AS moderadora
       FROM reportes_contenido rc
       LEFT JOIN usuarios u ON u.id = rc.moderadora_id
       WHERE rc.estado IN ('resuelto', 'desestimado')
       ORDER BY rc.fecha_resolucion DESC`
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error en getHistorial:', err);
    return res.status(500).json({ error: err.message });
  }
};

const ACCIONES_FRONTEND = {
  eliminar_contenido: { estado: 'resuelto', accion_tomada: 'eliminado' },
  emitir_advertencia: { estado: 'resuelto', accion_tomada: 'advertencia' },
  suspender_cuenta: { estado: 'resuelto', accion_tomada: 'cuenta_suspendida' },
  desestimar: { estado: 'desestimado', accion_tomada: null },
};

const accionModeracionReporte = async (req, res) => {
  try {
    const { accion, notas_moderacion } = req.body;
    const mapped = ACCIONES_FRONTEND[accion];

    if (!mapped) {
      return res.status(400).json({ error: 'accion inválida' });
    }

    req.body = {
      estado: mapped.estado,
      accion_tomada: mapped.accion_tomada,
      notas_moderacion,
    };

    return resolverReporte(req, res);
  } catch (err) {
    console.error('Error en accionModeracionReporte:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crearReporte,
  listarReportes,
  resolverReporte,
  getModerationStats,
  getHistorial,
  accionModeracionReporte,
};
