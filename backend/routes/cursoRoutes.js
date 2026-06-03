const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ver todos los cursos 
router.get('/', verificarToken, cursoController.obtenerCursos);

// Crear un curso
router.post('/', verificarToken, verificarRol(['admin']), cursoController.crearCurso);

// ACTUALIZAR un curso (Asegúrate de que esta línea exista)
router.put(
  '/:id', 
  verificarToken, 
  verificarRol(['admin']), 
  cursoController.actualizarCurso
);

// ELIMINAR un curso
router.delete(
  '/:id', 
  verificarToken, 
  verificarRol(['admin']), 
  cursoController.eliminarCurso
);

module.exports = router;