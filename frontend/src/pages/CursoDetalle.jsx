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
  1: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  2: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  3: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
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

  // Profesor: crear evaluación
  const [mostrarFormEval, setMostrarFormEval] = useState(false);
  const [formEval, setFormEval] = useState({ titulo: '', descripcion: '', semana: '', numero_corte: '1' });

  // Toast de confirmación
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  // Profesor: ver entregas de una evaluación
  const [entregasAbiertas, setEntregasAbiertas] = useState({});
  const [notasTemp, setNotasTemp] = useState({});

  // Estudiante: entregas propias
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

  // Estudiante: carga su entrega para cada evaluación
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-indigo-300">
        <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Cargando curso...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">

      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 animate-slide-down">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-xl truncate">{curso?.titulo}</h1>
            <p className="text-indigo-300 text-sm">
              {curso?.profesor ? `Profesor: ${curso.profesor.nombre} ${curso.profesor.apellido}` : 'Sin profesor asignado'}
              {curso?.fecha_inicio && ` · Inicio: ${curso.fecha_inicio}`}
              {curso?.fecha_fin && ` · Fin: ${curso.fecha_fin}`}
            </p>
          </div>
          {esProfesor && (
            <button
              onClick={() => setMostrarFormEval(!mostrarFormEval)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
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
          <form onSubmit={handleCrearEval} className="mb-8 p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl animate-slide-down">
            <h3 className="text-indigo-300 font-semibold text-sm uppercase tracking-wide mb-4">Nueva Evaluación</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input required placeholder="Título de la evaluación" value={formEval.titulo}
                onChange={e => setFormEval({ ...formEval, titulo: e.target.value })}
                className="col-span-2 px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
              <input placeholder="Descripción (opcional)" value={formEval.descripcion}
                onChange={e => setFormEval({ ...formEval, descripcion: e.target.value })}
                className="col-span-2 px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
              <div>
                <label className="text-indigo-200 text-xs font-medium block mb-1.5">Semana</label>
                <input required type="number" min="1" placeholder="Ej. 3" value={formEval.semana}
                  onChange={e => setFormEval({ ...formEval, semana: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" />
              </div>
              <div>
                <label className="text-indigo-200 text-xs font-medium block mb-1.5">Corte</label>
                <select value={formEval.numero_corte} onChange={e => setFormEval({ ...formEval, numero_corte: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">
                  <option value="1">Corte 1</option>
                  <option value="2">Corte 2</option>
                  <option value="3">Corte 3</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all">
              Guardar evaluación
            </button>
          </form>
        )}

        {/* Sin evaluaciones */}
        {numerosSemana.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {esProfesor ? 'No hay evaluaciones aún. Crea la primera.' : 'El profesor aún no ha publicado evaluaciones.'}
          </div>
        )}

        {/* Semanas */}
        <div className="space-y-8">
          {numerosSemana.map((semana, si) => (
            <div key={semana} className="animate-slide-up" style={{ animationDelay: `${si * 0.07}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold">
                  {semana}
                </div>
                <h2 className="text-white font-bold text-lg">Semana {semana}</h2>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-3">
                {semanas[semana].map((ev) => {
                  const c = CORTE_COLORS[ev.numero_corte] || CORTE_COLORS[1];
                  const entregasEv = entregasAbiertas[ev.id];
                  const miEntrega = misEntregas[ev.id];

                  return (
                    <div key={ev.id} className={`rounded-2xl border p-5 ${c.bg} ${c.border} transition-all duration-300`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>Corte {ev.numero_corte}</span>
                          </div>
                          <h3 className="text-white font-semibold">{ev.titulo}</h3>
                          {ev.descripcion && <p className="text-gray-400 text-sm mt-1">{ev.descripcion}</p>}
                        </div>
                        {esProfesor && (
                          <button onClick={() => handleEliminarEval(ev.id)} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all text-xs">
                            ✕
                          </button>
                        )}
                      </div>

                      {/* VISTA PROFESOR: entregas de estudiantes */}
                      {esProfesor && (
                        <div className="mt-3">
                          <button onClick={() => toggleEntregas(ev.id)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${c.border} ${c.text} bg-white/5 hover:bg-white/10`}>
                            {entregasEv ? 'Ocultar entregas' : 'Ver entregas'}
                          </button>
                          {entregasEv && (
                            <div className="mt-3 space-y-2 animate-slide-down">
                              {entregasEv.length === 0 && <p className="text-xs text-gray-500 italic">Sin entregas aún.</p>}
                              {entregasEv.map((ent) => (
                                <div key={ent.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium">{ent.matricula?.estudiante?.nombre} {ent.matricula?.estudiante?.apellido}</p>
                                    <p className="text-gray-400 text-xs mt-0.5 truncate">"{ent.contenido}"</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <input
                                      type="number" min="0" max="100" step="0.01"
                                      placeholder="Nota"
                                      defaultValue={ent.calificacion ?? ''}
                                      onChange={e => setNotasTemp(prev => ({ ...prev, [ent.id]: e.target.value }))}
                                      className="w-20 px-2 py-1.5 bg-white/5 border border-white/15 rounded-lg text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                    <button onClick={() => handleCalificar(ent.id, ev.id)} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-lg transition-all">
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
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Tu entrega</p>
                                <p className="text-gray-300 text-sm">"{miEntrega.contenido}"</p>
                              </div>
                              <div className="text-right shrink-0 ml-3">
                                <p className="text-xs text-gray-500 mb-0.5">Nota</p>
                                <p className={`text-lg font-bold ${miEntrega.calificacion !== null ? c.text : 'text-gray-600'}`}>
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
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                              />
                              <button onClick={() => handleEnviarEntrega(ev.id)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shrink-0">
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
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border animate-slide-up
          ${toast.tipo === 'error'
            ? 'bg-red-900/90 border-red-500/40 text-red-200'
            : 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200'}`}>
          {toast.tipo === 'error' ? (
            <svg className="w-5 h-5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium text-sm">{toast.mensaje}</span>
        </div>
      )}
    </div>
  );
};
