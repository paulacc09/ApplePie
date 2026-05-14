const express = require('express');
const pagosController = require('../controllers/pagosController');
const verificarToken = require('../middleware/verificarToken');
const verificarRol = require('../middleware/verificarRol');

const router = express.Router();

router.post('/', verificarToken, pagosController.registrarPago);
router.get('/historial', verificarToken, pagosController.historialPagos);
router.patch(
  '/:id/estado',
  verificarToken,
  verificarRol(['admin']),
  pagosController.actualizarEstadoPago
);

module.exports = router;
