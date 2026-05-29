const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacionController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Crear una evaluación
router.post('/', verificarToken, verificarRol(['admin', 'profesor']), evaluacionController.crearEvaluacion);

// Ver todas las evaluaciones
router.get('/', verificarToken, verificarRol(['admin', 'profesor']), evaluacionController.obtenerEvaluaciones);

// Modificar una evaluación específica por su ID
router.put('/:id', verificarToken, verificarRol(['admin', 'profesor']), evaluacionController.actualizarEvaluacion);

// Eliminar una evaluación específica por su ID
router.delete('/:id', verificarToken, verificarRol(['admin', 'profesor']), evaluacionController.eliminarEvaluacion);

module.exports = router;