const API_URL = 'http://localhost:3000/api/matriculas';

export const matricularEstudiante = async (curso_id) => {
  const token = localStorage.getItem('token');
  
  if (!token) throw new Error('No estás autenticado');

  // Desciframos el token para obtener el ID del estudiante que inició sesión
  const payload = JSON.parse(atob(token.split('.')[1]));
  const usuario_id = payload.id;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    // Enviamos el ID del estudiante y el ID del curso al backend
    body: JSON.stringify({ usuario_id, curso_id })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al procesar la matrícula');
  }

  return data;
};