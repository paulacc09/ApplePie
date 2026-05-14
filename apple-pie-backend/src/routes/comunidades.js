const express = require('express');
const comunidadesController = require('../controllers/comunidadesController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/', comunidadesController.getComunidades);
router.get('/:id', comunidadesController.getComunidadById);
router.post('/', verificarToken, comunidadesController.crearComunidad);
router.post('/:id/unirse', verificarToken, comunidadesController.unirseAComunidad);

module.exports = router;
