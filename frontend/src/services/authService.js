const API_URL = 'http://localhost:3000/api/auth';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Si el servidor responde con error (ej. 401 Contraseña incorrecta), lanzamos el mensaje
    throw new Error(data.mensaje || 'Error al iniciar sesión');
  }

  // Si todo sale bien, guardamos el token en el navegador (LocalStorage)
  localStorage.setItem('token', data.token);
  return data;
};

export const registro = async (nombre, apellido, email, password, rol) => {
  const response = await fetch(`${API_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, email, password, rol }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al registrar el usuario');
  }

  return data;
};