const express = require('express');
const reportesController = require('../controllers/reportesController');
const verificarToken = require('../middleware/verificarToken');
const verificarRol = require('../middleware/verificarRol');

const router = express.Router();

router.post('/', verificarToken, reportesController.crearReporte);
router.get(
  '/',
  verificarToken,
  verificarRol(['admin', 'moderadora']),
  reportesController.listarReportes
);
router.patch(
  '/:id/resolver',
  verificarToken,
  verificarRol(['admin', 'moderadora']),
  reportesController.resolverReporte
);

router.get(
  '/stats',
  verificarToken,
  verificarRol(['admin', 'moderadora']),
  reportesController.getModerationStats
);
router.get(
  '/reportes',
  verificarToken,
  verificarRol(['admin', 'moderadora']),
  reportesController.listarReportes
);
router.post(
  '/reportes/:id/accion',
  verificarToken,
  verificarRol(['admin', 'moderadora']),
  reportesController.accionModeracionReporte
);

module.exports = router;
