const API_URL = 'http://localhost:3000/api/cursos';

export const obtenerCursos = async () => {
  // 1. Recuperamos el token que guardamos al iniciar sesión
  const token = localStorage.getItem('token');

  // 2. Hacemos la petición al backend, enviando el token en los Headers
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // <-- ¡Tu pase VIP!
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener los cursos');
  }

  return data; // Retorna el arreglo de cursos
};
// NUEVA FUNCIÓN: Crear un curso
export const crearCurso = async (titulo, descripcion) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // El token valida si eres admin/profesor
    },
    // Enviamos por defecto el estado en true (activo)
    body: JSON.stringify({ titulo, descripcion, estado: true }) 
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al crear el curso');
  }

  return data;
};