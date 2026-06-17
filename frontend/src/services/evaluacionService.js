const API_URL = 'http://localhost:3000/api/evaluaciones';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const crearEvaluacion = async (datos) => {
  const res = await fetch(API_URL, { method: 'POST', headers: headers(), body: JSON.stringify(datos) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al crear evaluación');
  return data;
};

export const obtenerEvaluacionesPorCurso = async (cursoId) => {
  const res = await fetch(`${API_URL}/curso/${cursoId}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener evaluaciones');
  return data;
};

export const eliminarEvaluacion = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar evaluación');
  return data;
};
