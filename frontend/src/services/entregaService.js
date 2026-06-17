const API_URL = 'http://localhost:3000/api/entregas';

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const crearEntrega = async (evaluacion_id, contenido) => {
  const res = await fetch(API_URL, { method: 'POST', headers: headers(), body: JSON.stringify({ evaluacion_id, contenido }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al enviar entrega');
  return data;
};

export const calificarEntrega = async (id, calificacion) => {
  const res = await fetch(`${API_URL}/${id}/calificar`, { method: 'PUT', headers: headers(), body: JSON.stringify({ calificacion }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al calificar');
  return data;
};

export const obtenerEntregasPorEvaluacion = async (evaluacionId) => {
  const res = await fetch(`${API_URL}/evaluacion/${evaluacionId}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener entregas');
  return data;
};

export const obtenerMiEntrega = async (evaluacionId) => {
  const res = await fetch(`${API_URL}/mi-entrega/${evaluacionId}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error al obtener tu entrega');
  return data;
};
