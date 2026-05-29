const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

// Ver todos los usuarios (Solo Admin)
const obtenerUsuarios = async (req, res) => {
  try {
    // Excluimos la contraseña por seguridad
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los usuarios', error: error.message });
  }
};

// Actualizar un usuario (Admin o el propio usuario)
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Preparar los datos a actualizar
    const datosActualizados = {
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      email: email || usuario.email,
      rol: rol || usuario.rol
    };

    // Si se envía una nueva contraseña, la encriptamos antes de guardar
    if (password) {
      datosActualizados.password = await bcrypt.hash(password, 10);
    }

    await usuario.update(datosActualizados);

    // Retornamos el usuario actualizado sin la contraseña
    const usuarioRespuesta = usuario.toJSON();
    delete usuarioRespuesta.password;

    res.status(200).json({ mensaje: 'Usuario actualizado con éxito', usuario: usuarioRespuesta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el usuario', error: error.message });
  }
};

// Eliminar un usuario (Solo Admin)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    await usuario.destroy();
    res.status(200).json({ mensaje: 'Usuario eliminado permanentemente de la base de datos.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el usuario', error: error.message });
  }
};

module.exports = { obtenerUsuarios, actualizarUsuario, eliminarUsuario };