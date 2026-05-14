const express = require('express');
const reportesController = require('../controllers/reportesController');
const verificarToken = require('../middleware/verificarToken');
const verificarRol = require('../middleware/verificarRol');

const router = express.Router();

router.post('/', verificarToken, reportesController.crearReporte);
router.get(
  '/',
  verificarToken,
  verificarRol(['admin']),
  reportesController.listarReportes
);
router.patch(
  '/:id/resolver',
  verificarToken,
  verificarRol(['admin']),
  reportesController.resolverReporte
);

module.exports = router;
