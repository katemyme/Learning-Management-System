const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/profesores', verificarToken, verificarRol(['admin']), usuarioController.obtenerProfesores);
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Ver todos los usuarios (Solo Admin)
router.get('/', verificarToken, verificarRol(['admin']), usuarioController.obtenerUsuarios);

// Actualizar un usuario por su ID (Solo Admin)
router.put('/:id', verificarToken, verificarRol(['admin']), usuarioController.actualizarUsuario);

// Eliminar un usuario por su ID (Solo Admin)
router.delete('/:id', verificarToken, verificarRol(['admin']), usuarioController.eliminarUsuario);

module.exports = router;