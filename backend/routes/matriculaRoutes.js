const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ruta para matricular (Protegida: solo admin o estudiante pueden matricularse)
router.post(
  '/', 
  verificarToken, 
  verificarRol(['admin', 'estudiante']), 
  matriculaController.matricularEstudiante
  
);
// Añade esta línea a tus rutas
router.get('/curso/:cursoId', verificarToken, verificarRol(['admin', 'profesor']), matriculaController.obtenerEstudiantesPorCurso);
// Añade esta línea a tus rutas
router.get('/mis-cursos', verificarToken, verificarRol(['estudiante']), matriculaController.obtenerMisCursos);

module.exports = router;