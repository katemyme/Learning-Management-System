const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.get('/profesores', verificarToken, verificarRol(['admin']), usuarioController.obtenerProfesores);
router.get('/', verificarToken, verificarRol(['admin']), usuarioController.obtenerUsuarios);
router.put('/:id', verificarToken, verificarRol(['admin']), usuarioController.actualizarUsuario);
router.delete('/:id', verificarToken, verificarRol(['admin']), usuarioController.eliminarUsuario);

module.exports = router;
