const express = require('express');
const recursosController = require('../controllers/recursosController');
const verificarToken = require('../middleware/verificarToken');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.get('/', recursosController.getRecursos);
router.get('/:id', recursosController.getRecursoById);
router.post(
  '/',
  verificarToken,
  upload.single('archivo'),
  recursosController.subirRecurso
);
router.delete('/:id', verificarToken, recursosController.eliminarRecurso);

module.exports = router;
