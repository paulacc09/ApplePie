const express = require('express');
const sesionesController = require('../controllers/sesionesController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/mentora', verificarToken, sesionesController.getSesionesMentora);
router.get('/estudiante', verificarToken, sesionesController.getSesionesEstudiante);
router.get('/:id', verificarToken, sesionesController.getSesionById);
router.post('/', verificarToken, sesionesController.crearSesion);
router.put('/:id', verificarToken, sesionesController.actualizarSesion);
router.post('/:id/valorar', verificarToken, sesionesController.valorarSesion);

module.exports = router;
