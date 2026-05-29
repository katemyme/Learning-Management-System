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

module.exports = router;