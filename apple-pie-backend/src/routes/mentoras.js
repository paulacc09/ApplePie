const express = require('express');
const mentorasController = require('../controllers/mentorasController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/', mentorasController.getMentoras);
router.post('/postular', verificarToken, mentorasController.postularse);
router.post('/postularse', verificarToken, mentorasController.postularse);
router.get('/:id/tarifas', mentorasController.getTarifas);
router.put('/:id/tarifas', verificarToken, mentorasController.upsertTarifas);
router.get('/:id/cursos', mentorasController.getCursos);
router.put('/:id/cursos', verificarToken, mentorasController.upsertCursos);
router.get('/:id/valoraciones', mentorasController.getValoraciones);
router.get('/:id', mentorasController.getMentoraById);
router.put('/:id', verificarToken, mentorasController.actualizarPerfil);

module.exports = router;
