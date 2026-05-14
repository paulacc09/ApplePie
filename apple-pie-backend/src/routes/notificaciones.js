const express = require('express');
const notificacionesController = require('../controllers/notificacionesController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/', verificarToken, notificacionesController.obtenerNotificaciones);
router.patch(
  '/leer-todas',
  verificarToken,
  notificacionesController.marcarTodasLeidas
);
router.patch('/:id/leer', verificarToken, notificacionesController.marcarLeida);

module.exports = router;
