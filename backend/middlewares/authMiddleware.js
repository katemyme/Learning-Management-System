const jwt = require('jsonwebtoken');

// 1. Verificar si el token es válido
const verificarToken = (req, res, next) => {
  // El token usualmente viaja en el header "Authorization" con el formato "Bearer <token>"
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = authHeader.split(' ')[1]; // Extraemos solo el texto del token
  if (!token) {
    return res.status(401).json({ mensaje: 'Formato de token inválido.' });
  }

  try {
    // Verificamos la firma con nuestro secreto
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardamos los datos del usuario (id y rol) dentro de 'req' para usarlos más adelante
    req.usuario = payload; 
    next(); // ¡Todo bien! Pasa al siguiente filtro o controlador
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};

// 2. Verificar si el usuario tiene el rol adecuado
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    // Revisamos si el rol del usuario actual está en la lista de los que permitimos pasar
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción.' });
    }
    next(); // ¡Tiene el rol correcto! Pasa
  };
};

module.exports = { verificarToken, verificarRol };