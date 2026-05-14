const express = require('express');
const mentorasController = require('../controllers/mentorasController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/', mentorasController.getMentoras);
router.post('/postularse', verificarToken, mentorasController.postularse);
router.get('/:id', mentorasController.getMentoraById);
router.put('/:id', verificarToken, mentorasController.actualizarPerfil);

module.exports = router;
