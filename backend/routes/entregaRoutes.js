const express = require('express');
const router = express.Router();
const entregaController = require('../controllers/entregaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, verificarRol(['estudiante']), entregaController.crearEntrega);
router.put('/:id/calificar', verificarToken, verificarRol(['admin', 'profesor']), entregaController.calificarEntrega);
router.get('/evaluacion/:evaluacionId', verificarToken, verificarRol(['admin', 'profesor']), entregaController.obtenerEntregasPorEvaluacion);
router.get('/mi-entrega/:evaluacionId', verificarToken, verificarRol(['estudiante']), entregaController.obtenerMiEntrega);

module.exports = router;
