const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar un nuevo usuario: POST http://localhost:3000/api/auth/registro
router.post('/registro', authController.registrar);

// Ruta para iniciar sesión: POST http://localhost:3000/api/auth/login
router.post('/login', authController.login);

module.exports = router;