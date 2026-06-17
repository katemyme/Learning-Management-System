const API_URL = 'http://localhost:3000/api/cursos';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const obtenerCursos = async () => {
  const res = await fetch(API_URL, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener cursos');
  return data;
};

export const obtenerDetalleCurso = async (id) => {
  const res = await fetch(`${API_URL}/${id}/detalle`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener detalle del curso');
  return data;
};

export const crearCurso = async ({ titulo, descripcion, profesor_id, fecha_inicio, fecha_fin }) => {
  const res = await fetch(API_URL, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ titulo, descripcion, estado: true, profesor_id, fecha_inicio, fecha_fin })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear el curso');
  return data;
};

export const obtenerProfesores = async () => {
  const res = await fetch('http://localhost:3000/api/usuarios/profesores', { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener profesores');
  return data;
};
