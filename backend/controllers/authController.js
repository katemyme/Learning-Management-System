const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// ==========================================
// REGISTRO DE USUARIO
// ==========================================
const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // 1. Verificar si el correo ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar la contraseña (hash)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Crear el usuario en la base de datos
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password_hash,
      rol
    });

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario', error: error.message });
  }
};

// ==========================================
// LOGIN DE USUARIO
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario por email y verificar contraseña
    const usuario = await Usuario.findOne({ where: { email } });
    const passwordValida = usuario && await bcrypt.compare(password, usuario.password_hash);
    if (!usuario || !passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    // 3. Generar el Token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol }, // Payload (datos que viajan en el token)
      process.env.JWT_SECRET,               // Firma secreta
      { expiresIn: '8h' }                   // Tiempo de expiración
    );

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = {
  registrar,
  login
};