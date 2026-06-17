const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacionController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, verificarRol(['admin', 'profesor']), evaluacionController.crearEvaluacion);
router.get('/curso/:cursoId', verificarToken, evaluacionController.obtenerEvaluacionesPorCurso);
router.delete('/:id', verificarToken, verificarRol(['admin', 'profesor']), evaluacionController.eliminarEvaluacion);

module.exports = router;
