import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCursos, crearCurso, obtenerProfesores } from '../services/cursoService';
import { matricularEstudiante, obtenerEstudiantesDeCurso, obtenerMisCursos, asignarNota } from '../services/matriculaService';

const obtenerRol = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])).rol; } catch { return null; }
};

const RolBadge = ({ rol }) => {
  const config = {
    admin:      { label: 'Administrador', bg: 'bg-red-100 text-red-700 border-red-200' },
    profesor:   { label: 'Profesor',      bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    estudiante: { label: 'Estudiante',    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  };
  const c = config[rol] || { label: rol, bg: 'bg-gray-100 text-gray-600 border-gray-200' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>{c.label}</span>;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const rolUsuario = obtenerRol();
  const puedeCrearCursos    = rolUsuario === 'admin';
  const puedeVerEstudiantes = rolUsuario === 'admin' || rolUsuario === 'profesor';
  const esEstudiante        = rolUsuario === 'estudiante';

  const [cursos, setCursos]               = useState([]);
  const [misCursos, setMisCursos]         = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState('');
  const [vistaActual, setVistaActual]     = useState('catalogo');
  const [estudiantesCurso, setEstudiantesCurso] = useState([]);
  const [cursoViendo, setCursoViendo]     = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const [formCurso, setFormCurso] = useState({ titulo: '', descripcion: '', profesor_id: '', fecha_inicio: '', fecha_fin: '' });
  const [estudianteACalificar, setEstudianteACalificar] = useState(null);
  const [notaTemporal, setNotaTemporal]   = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try { const data = await obtenerCursos(); setCursos(data); }
    catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }, []);

  const cargarMisCursos = useCallback(async () => {
    try { const data = await obtenerMisCursos(); setMisCursos(data); }
    catch (err) { setError(err.message); }
  }, []);

  useEffect(() => {
    if (vistaActual === 'catalogo') cargarDatos();
    else if (vistaActual === 'misCursos') cargarMisCursos();
  }, [vistaActual, cargarDatos, cargarMisCursos]);

  const handleCerrarSesion = () => { localStorage.removeItem('token'); navigate('/'); };

  const abrirFormCurso = async () => {
    if (!mostrarFormulario && profesores.length === 0) {
      try { const p = await obtenerProfesores(); setProfesores(p); } catch {}
    }
    setMostrarFormulario(!mostrarFormulario);
  };

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    try {
      await crearCurso(formCurso);
      setFormCurso({ titulo: '', descripcion: '', profesor_id: '', fecha_inicio: '', fecha_fin: '' });
      setMostrarFormulario(false);
      cargarDatos();
    } catch (err) { alert(err.message); }
  };

  const handleMatricular = async (cursoId) => {
    try { await matricularEstudiante(cursoId); setVistaActual('misCursos'); }
    catch (err) { alert(err.message); }
  };

  const handleVerEstudiantes = async (cursoId) => {
    if (cursoViendo === cursoId) { setCursoViendo(null); setEstudiantesCurso([]); return; }
    try { const data = await obtenerEstudiantesDeCurso(cursoId); setEstudiantesCurso(data); setCursoViendo(cursoId); }
    catch (err) { alert(err.message); }
  };

  const abrirModalCalificar = (matricula) => {
    setEstudianteACalificar({
      id: matricula.id,
      nombre: `${matricula.estudiante?.nombre || ''} ${matricula.estudiante?.apellido || ''}`.trim()
    });
    setNotaTemporal(matricula.nota_semestre || '');
  };

  const guardarNota = async () => {
    if (!notaTemporal.toString().trim()) return;
    try {
      await asignarNota(estudianteACalificar.id, notaTemporal);
      const data = await obtenerEstudiantesDeCurso(cursoViendo);
      setEstudiantesCurso(data);
      setEstudianteACalificar(null); setNotaTemporal('');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-gray-900 font-bold">LMS Platform</span>
              <div className="mt-0.5"><RolBadge rol={rolUsuario} /></div>
            </div>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-600 text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs (solo estudiante) */}
        {esEstudiante && (
          <div className="flex gap-0 mb-8 border-b border-gray-200 animate-slide-up">
            {[{ id: 'catalogo', label: 'Catálogo de Cursos' }, { id: 'misCursos', label: 'Mis Cursos' }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVistaActual(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                  vistaActual === tab.id
                    ? 'border-slate-800 text-slate-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ===== VISTA: MIS CURSOS ===== */}
        {vistaActual === 'misCursos' && esEstudiante && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mis Cursos Inscritos</h2>
            {misCursos.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <svg className="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="font-medium text-gray-500">No estás inscrito en ningún curso</p>
                <p className="text-sm mt-1 text-gray-400">Ve al catálogo y matricúlate en uno</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {misCursos.map((mat, i) => (
                  <div key={mat.id} onClick={() => navigate(`/curso/${mat.curso?.id}`)} className="cursor-pointer bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <h3 className="text-gray-900 font-bold text-base mb-1">{mat.curso?.titulo || 'Curso sin nombre'}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{mat.curso?.descripcion || 'Sin descripción'}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                        Activa
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">Calificación</p>
                        <p className={`font-bold text-lg ${mat.nota_semestre ? 'text-blue-600' : 'text-gray-300'}`}>
                          {mat.nota_semestre ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== VISTA: CATÁLOGO ===== */}
        {vistaActual === 'catalogo' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Catálogo de Cursos</h2>
                <p className="text-gray-500 text-sm mt-0.5">{cursos.length} curso{cursos.length !== 1 ? 's' : ''} disponible{cursos.length !== 1 ? 's' : ''}</p>
              </div>
              {puedeCrearCursos && (
                <button
                  onClick={abrirFormCurso}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${mostrarFormulario ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {mostrarFormulario ? 'Cancelar' : 'Nuevo Curso'}
                </button>
              )}
            </div>

            {/* Formulario crear curso */}
            {mostrarFormulario && puedeCrearCursos && (
              <form onSubmit={handleCrearCurso} className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl animate-slide-down">
                <h3 className="text-gray-700 font-semibold mb-4 text-sm uppercase tracking-wide">Nuevo curso</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input required type="text" placeholder="Título del curso" value={formCurso.titulo}
                    onChange={e => setFormCurso({ ...formCurso, titulo: e.target.value })}
                    className="col-span-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  <input type="text" placeholder="Descripción breve..." value={formCurso.descripcion}
                    onChange={e => setFormCurso({ ...formCurso, descripcion: e.target.value })}
                    className="col-span-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  <div>
                    <label className="text-gray-600 text-xs font-medium block mb-1.5">Profesor</label>
                    <select value={formCurso.profesor_id} onChange={e => setFormCurso({ ...formCurso, profesor_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="">Sin asignar</option>
                      {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-600 text-xs font-medium block mb-1.5">Fecha inicio</label>
                      <input type="date" value={formCurso.fecha_inicio} onChange={e => setFormCurso({ ...formCurso, fecha_inicio: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs font-medium block mb-1.5">Fecha fin</label>
                      <input type="date" value={formCurso.fecha_fin} onChange={e => setFormCurso({ ...formCurso, fecha_fin: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>
                </div>
                <button type="submit" className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  Guardar curso
                </button>
              </form>
            )}

            {cargando && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            {!cargando && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cursos.map((curso, i) => (
                  <div key={curso.id} onClick={() => navigate(`/curso/${curso.id}`)} className="cursor-pointer bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-gray-900 font-bold text-base leading-tight">{curso.titulo}</h3>
                      <span className={`ml-2 shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${curso.estado ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {curso.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm flex-1 mb-4 line-clamp-2">{curso.descripcion || 'Sin descripción'}</p>

                    {esEstudiante && curso.estado && (
                      <button onClick={(e) => { e.stopPropagation(); handleMatricular(curso.id); }} className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors duration-200">
                        Inscribirse al curso
                      </button>
                    )}

                    {puedeVerEstudiantes && (
                      <button onClick={(e) => { e.stopPropagation(); handleVerEstudiantes(curso.id); }} className="w-full py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-800 text-sm font-medium transition-all duration-200">
                        {cursoViendo === curso.id ? 'Ocultar información' : 'Ver más información'}
                      </button>
                    )}

                    {cursoViendo === curso.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-down">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Estudiantes matriculados</p>
                        {estudiantesCurso.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No hay alumnos inscritos aún.</p>
                        ) : (
                          <ul className="space-y-2">
                            {estudiantesCurso.map((mat) => (
                              <li key={mat.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 gap-2">
                                <div>
                                  <p className="text-gray-900 text-sm font-medium">{mat.estudiante?.nombre} {mat.estudiante?.apellido}</p>
                                  <p className="text-xs text-gray-400">Nota: <span className={`font-semibold ${mat.nota_semestre ? 'text-blue-600' : 'text-gray-300'}`}>{mat.nota_semestre ?? '—'}</span></p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); abrirModalCalificar(mat); }} className="shrink-0 px-3 py-1.5 bg-amber-50 hover:bg-amber-500 border border-amber-200 text-amber-700 hover:text-white text-xs font-semibold rounded-lg transition-all duration-200">
                                  Calificar
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {cursos.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    <svg className="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500">No hay cursos en el catálogo todavía.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Calificación */}
      {estudianteACalificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-gray-900 font-bold text-lg">Asignar calificación</h3>
              <button onClick={() => setEstudianteACalificar(null)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Evaluando a: <span className="text-gray-900 font-semibold">{estudianteACalificar.nombre}</span>
            </p>
            <input
              type="number" min="0" max="100" step="0.01"
              placeholder="Nota (0 – 100)"
              value={notaTemporal}
              onChange={(e) => setNotaTemporal(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-lg font-semibold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-5"
            />
            <div className="flex gap-3">
              <button onClick={() => setEstudianteACalificar(null)} className="flex-1 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium transition-all">
                Cancelar
              </button>
              <button onClick={guardarNota} className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors">
                Guardar nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
