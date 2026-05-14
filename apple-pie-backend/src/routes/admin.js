const express = require('express');
const adminController = require('../controllers/adminController');
const verificarToken = require('../middleware/verificarToken');
const verificarRol = require('../middleware/verificarRol');

const router = express.Router();

router.get(
  '/usuarios',
  verificarToken,
  verificarRol(['admin']),
  adminController.listarUsuarios
);
router.patch(
  '/usuarios/:id/rol',
  verificarToken,
  verificarRol(['admin']),
  adminController.cambiarRol
);
router.patch(
  '/usuarios/:id/activo',
  verificarToken,
  verificarRol(['admin']),
  adminController.cambiarActivo
);

module.exports = router;
