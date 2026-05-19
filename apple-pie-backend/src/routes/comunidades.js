const express = require('express');
const comunidadesController = require('../controllers/comunidadesController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/', comunidadesController.getComunidades);
router.get('/:id/miembros', verificarToken, comunidadesController.getMiembrosComunidad);
router.get('/:id/sesiones', verificarToken, comunidadesController.getSesionesComunidad);
router.get('/:id', comunidadesController.getComunidadById);
router.post('/', verificarToken, comunidadesController.crearComunidad);
router.post('/:id/sesiones', verificarToken, comunidadesController.crearSesionComunidad);
router.post('/:id/unirse', verificarToken, comunidadesController.unirseAComunidad);
router.delete('/:id/salir', verificarToken, comunidadesController.salirDeComunidad);

module.exports = router;
