const express = require('express');
const foroController = require('../controllers/foroController');
const verificarToken = require('../middleware/verificarToken');

const router = express.Router();

router.get('/comunidades/:comunidadId/foro', foroController.getPublicaciones);
router.post(
  '/comunidades/:comunidadId/foro',
  verificarToken,
  foroController.crearPublicacion
);
router.delete(
  '/comunidades/:comunidadId/foro/:id',
  verificarToken,
  foroController.eliminarPublicacion
);
router.get(
  '/comunidades/:comunidadId/foro/:publicacionId/respuestas',
  foroController.getRespuestas
);
router.post(
  '/comunidades/:comunidadId/foro/:publicacionId/respuestas',
  verificarToken,
  foroController.crearRespuesta
);
router.delete(
  '/comunidades/:comunidadId/foro/:publicacionId/respuestas/:id',
  verificarToken,
  foroController.eliminarRespuesta
);

module.exports = router;
