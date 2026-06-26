import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDetalleCurso } from '../services/cursoService';
import { obtenerEvaluacionesPorCurso, crearEvaluacion, eliminarEvaluacion } from '../services/evaluacionService';
import { crearEntrega, obtenerEntregasPorEvaluacion, obtenerMiEntrega, calificarEntrega } from '../services/entregaService';

const obtenerRol = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])).rol; } catch { return null; }
};

const CORTE_COLORS = {
  1: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  2: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
  3: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
};

export const CursoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const rol = obtenerRol();
  const esProfesor = rol === 'profesor' || rol === 'admin';
  const esEstudiante = rol === 'estudiante';

  const [curso, setCurso] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarFormEval, setMostrarFormEval] = useState(false);
  const [formEval, setFormEval] = useState({ titulo: '', descripcion: '', semana: '', numero_corte: '1' });

  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const [entregasAbiertas, setEntregasAbiertas] = useState({});
  const [notasTemp, setNotasTemp] = useState({});

  const [misEntregas, setMisEntregas] = useState({});
  const [textoEntrega, setTextoEntrega] = useState({});

  const cargar = useCallback(async () => {
    try {
      const [cursoData, evals] = await Promise.all([
        obtenerDetalleCurso(id),
        obtenerEvaluacionesPorCurso(id),
      ]);
      setCurso(cursoData);
      setEvaluaciones(evals);
    } catch (err) {
      alert(err.message);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    if (!esEstudiante || evaluaciones.length === 0) return;
    evaluaciones.forEach(async (ev) => {
      try {
        const entrega = await obtenerMiEntrega(ev.id);
        setMisEntregas(prev => ({ ...prev, [ev.id]: entrega }));
      } catch {}
    });
  }, [evaluaciones, esEstudiante]);

  const agruparPorSemana = () => {
    const mapa = {};
    for (const ev of evaluaciones) {
      if (!mapa[ev.semana]) mapa[ev.semana] = [];
      mapa[ev.semana].push(ev);
    }
    return mapa;
  };

  const handleCrearEval = async (e) => {
    e.preventDefault();
    try {
      await crearEvaluacion({ ...formEval, curso_id: id });
      setFormEval({ titulo: '', descripcion: '', semana: '', numero_corte: '1' });
      setMostrarFormEval(false);
      cargar();
    } catch (err) { alert(err.message); }
  };

  const handleEliminarEval = async (evalId) => {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    try { await eliminarEvaluacion(evalId); cargar(); }
    catch (err) { alert(err.message); }
  };

  const toggleEntregas = async (evalId) => {
    if (entregasAbiertas[evalId]) {
      setEntregasAbiertas(prev => ({ ...prev, [evalId]: null }));
      return;
    }
    try {
      const data = await obtenerEntregasPorEvaluacion(evalId);
      setEntregasAbiertas(prev => ({ ...prev, [evalId]: data }));
    } catch (err) { alert(err.message); }
  };

  const handleCalificar = async (entregaId, evalId) => {
    const nota = notasTemp[entregaId];
    if (nota === undefined || nota === '') return;
    try {
      await calificarEntrega(entregaId, nota);
      const data = await obtenerEntregasPorEvaluacion(evalId);
      setEntregasAbiertas(prev => ({ ...prev, [evalId]: data }));
      mostrarToast('Calificación guardada correctamente');
    } catch (err) { mostrarToast(err.message, 'error'); }
  };

  const handleEnviarEntrega = async (evalId) => {
    const contenido = textoEntrega[evalId];
    if (!contenido?.trim()) return alert('Escribe algo para entregar.');
    try {
      const result = await crearEntrega(evalId, contenido);
      setMisEntregas(prev => ({ ...prev, [evalId]: result.entrega }));
      setTextoEntrega(prev => ({ ...prev, [evalId]: '' }));
    } catch (err) { alert(err.message); }
  };

  const semanas = agruparPorSemana();
  const numerosSemana = Object.keys(semanas).sort((a, b) => Number(a) - Number(b));

  if (cargando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Cargando curso...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 animate-slide-down">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-gray-900 font-bold text-xl truncate">{curso?.titulo}</h1>
            <p className="text-gray-500 text-sm">
              {curso?.profesor ? `Profesor: ${curso.profesor.nombre} ${curso.profesor.apellido}` : 'Sin profesor asignado'}
              {curso?.fecha_inicio && ` · Inicio: ${curso.fecha_inicio}`}
              {curso?.fecha_fin && ` · Fin: ${curso.fecha_fin}`}
            </p>
          </div>
          {esProfesor && (
            <button
              onClick={() => setMostrarFormEval(!mostrarFormEval)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${mostrarFormEval ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {mostrarFormEval ? 'Cancelar' : 'Nueva Evaluación'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Formulario nueva evaluación */}
        {mostrarFormEval && esProfesor && (
          <form onSubmit={handleCrearEval} className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-xl animate-slide-down">
            <h3 className="text-gray-700 font-semibold text-sm uppercase tracking-wide mb-4">Nueva Evaluación</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input required placeholder="Título de la evaluación" value={formEval.titulo}
                onChange={e => setFormEval({ ...formEval, titulo: e.target.value })}
                className="col-span-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <input placeholder="Descripción (opcional)" value={formEval.descripcion}
                onChange={e => setFormEval({ ...formEval, descripcion: e.target.value })}
                className="col-span-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <div>
                <label className="text-gray-600 text-xs font-medium block mb-1.5">Semana</label>
                <input required type="number" min="1" placeholder="Ej. 3" value={formEval.semana}
                  onChange={e => setFormEval({ ...formEval, semana: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="text-gray-600 text-xs font-medium block mb-1.5">Corte</label>
                <select value={formEval.numero_corte} onChange={e => setFormEval({ ...formEval, numero_corte: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                  <option value="1">Corte 1</option>
                  <option value="2">Corte 2</option>
                  <option value="3">Corte 3</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Guardar evaluación
            </button>
          </form>
        )}

        {/* Sin evaluaciones */}
        {numerosSemana.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <svg className="w-14 h-14 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">{esProfesor ? 'No hay evaluaciones aún. Crea la primera.' : 'El profesor aún no ha publicado evaluaciones.'}</p>
          </div>
        )}

        {/* Semanas */}
        <div className="space-y-8">
          {numerosSemana.map((semana, si) => (
            <div key={semana} className="animate-slide-up" style={{ animationDelay: `${si * 0.07}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
                  {semana}
                </div>
                <h2 className="text-gray-900 font-bold text-lg">Semana {semana}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-3">
                {semanas[semana].map((ev) => {
                  const c = CORTE_COLORS[ev.numero_corte] || CORTE_COLORS[1];
                  const entregasEv = entregasAbiertas[ev.id];
                  const miEntrega = misEntregas[ev.id];

                  return (
                    <div key={ev.id} className={`rounded-xl border p-5 ${c.bg} ${c.border} transition-all duration-300`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>Corte {ev.numero_corte}</span>
                          </div>
                          <h3 className="text-gray-900 font-semibold">{ev.titulo}</h3>
                          {ev.descripcion && <p className="text-gray-600 text-sm mt-1">{ev.descripcion}</p>}
                        </div>
                        {esProfesor && (
                          <button onClick={() => handleEliminarEval(ev.id)} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all text-xs border border-red-200">
                            ✕
                          </button>
                        )}
                      </div>

                      {/* VISTA PROFESOR: entregas de estudiantes */}
                      {esProfesor && (
                        <div className="mt-3">
                          <button onClick={() => toggleEntregas(ev.id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all bg-white hover:bg-gray-50 ${c.border} ${c.text}`}>
                            {entregasEv ? 'Ocultar entregas' : 'Ver entregas'}
                          </button>
                          {entregasEv && (
                            <div className="mt-3 space-y-2 animate-slide-down">
                              {entregasEv.length === 0 && <p className="text-xs text-gray-400 italic">Sin entregas aún.</p>}
                              {entregasEv.map((ent) => (
                                <div key={ent.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 text-sm font-medium">{ent.matricula?.estudiante?.nombre} {ent.matricula?.estudiante?.apellido}</p>
                                    <p className="text-gray-500 text-xs mt-0.5 truncate">"{ent.contenido}"</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <input
                                      type="number" min="0" max="100" step="0.01"
                                      placeholder="Nota"
                                      defaultValue={ent.calificacion ?? ''}
                                      onChange={e => setNotasTemp(prev => ({ ...prev, [ent.id]: e.target.value }))}
                                      className="w-20 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button onClick={() => handleCalificar(ent.id, ev.id)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors">
                                      {ent.calificacion !== null ? 'Actualizar' : 'Calificar'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* VISTA ESTUDIANTE: su entrega y nota */}
                      {esEstudiante && (
                        <div className="mt-3">
                          {miEntrega ? (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Tu entrega</p>
                                <p className="text-gray-700 text-sm">"{miEntrega.contenido}"</p>
                              </div>
                              <div className="text-right shrink-0 ml-3">
                                <p className="text-xs text-gray-400 mb-0.5">Nota</p>
                                <p className={`text-lg font-bold ${miEntrega.calificacion !== null ? c.text : 'text-gray-300'}`}>
                                  {miEntrega.calificacion !== null ? miEntrega.calificacion : '—'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 mt-1">
                              <input
                                type="text"
                                placeholder="Escribe tu respuesta..."
                                value={textoEntrega[ev.id] || ''}
                                onChange={e => setTextoEntrega(prev => ({ ...prev, [ev.id]: e.target.value }))}
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              />
                              <button onClick={() => handleEnviarEntrega(ev.id)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
                                Entregar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Toast de confirmación */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border animate-slide-up
          ${toast.tipo === 'error'
            ? 'bg-white border-red-200 text-red-700'
            : 'bg-white border-emerald-200 text-emerald-700'}`}>
          {toast.tipo === 'error' ? (
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium text-sm">{toast.mensaje}</span>
        </div>
      )}
    </div>
  );
};
