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

export const obtenerEstudiantesDeCurso = async (cursoId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/curso/${cursoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener la lista de estudiantes');
  }

  return data;
};
// NUEVA FUNCIÓN: Obtener los cursos del estudiante logueado
export const obtenerMisCursos = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/mis-cursos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener tus cursos');
  }

  return data; // Retorna las matrículas con la información de los cursos
};