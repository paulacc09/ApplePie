const express = require('express');
const perfilController = require('../controllers/perfilController');
const verificarToken = require('../middleware/verificarToken');
const { upload } = require('../utils/cloudinary');

const router = express.Router();

router.get('/', verificarToken, perfilController.obtenerPerfil);
router.put('/', verificarToken, perfilController.actualizarPerfil);
router.patch(
  '/foto',
  verificarToken,
  upload.single('foto'),
  perfilController.actualizarFoto
);

module.exports = router;
