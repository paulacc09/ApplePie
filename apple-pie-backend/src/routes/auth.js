const express = require('express');
const authController = require('../controllers/authController');
const verificarToken = require('../middleware/verificarToken');
const verificarRol = require('../middleware/verificarRol');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post(
  '/mfa/generar',
  verificarToken,
  verificarRol(['admin']),
  authController.generarMFA
);
router.post(
  '/mfa/verificar',
  verificarToken,
  verificarRol(['admin']),
  authController.verificarMFA
);
router.post('/mfa/validar', authController.validarMFA);

module.exports = router;
