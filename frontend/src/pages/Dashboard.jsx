import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCursos, crearCurso } from '../services/cursoService';
import { matricularEstudiante, obtenerEstudiantesDeCurso, obtenerMisCursos, asignarNota } from '../services/matriculaService'; 

export const Dashboard = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [estudiantesCurso, setEstudiantesCurso] = useState([]);
  const [cursoViendo, setCursoViendo] = useState(null);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');

  const [vistaActual, setVistaActual] = useState('catalogo'); 
  const [misCursos, setMisCursos] = useState([]);

  // NUEVOS ESTADOS PARA EL MODAL ANIMADO
  const [estudianteACalificar, setEstudianteACalificar] = useState(null);
  const [notaTemporal, setNotaTemporal] = useState('');

  const obtenerRol = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol;
    } catch {
      return null;
    }
  };

  const rolUsuario = obtenerRol();
  const puedeCrearCursos = rolUsuario === 'admin'; 
  const puedeVerEstudiantes = rolUsuario === 'admin' || rolUsuario === 'profesor';
  const esEstudiante = rolUsuario === 'estudiante';

  const cargarDatos = useCallback(async () => {
    try {
      const data = await obtenerCursos();
      setCursos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []); 

  const cargarMisCursos = useCallback(async () => {
    try {
      const data = await obtenerMisCursos();
      setMisCursos(data);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  useEffect(() => {
    if (vistaActual === 'catalogo') {
      // eslint-disable-next-line
      cargarDatos();
    } else if (vistaActual === 'misCursos') {
      // eslint-disable-next-line
      cargarMisCursos();
    }
  }, [vistaActual, cargarDatos, cargarMisCursos]); 

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    try {
      await crearCurso(nuevoTitulo, nuevaDescripcion);
      alert('¡Curso creado exitosamente!');
      setNuevoTitulo('');
      setNuevaDescripcion('');
      setMostrarFormulario(false);
      cargarDatos(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMatricular = async (cursoId) => {
    try {
      await matricularEstudiante(cursoId);
      alert('¡Te has matriculado exitosamente en el curso!');
      setVistaActual('misCursos'); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerEstudiantes = async (cursoId) => {
    if (cursoViendo === cursoId) {
      setCursoViendo(null);
      setEstudiantesCurso([]);
      return;
    }
    try {
      const data = await obtenerEstudiantesDeCurso(cursoId);
      setEstudiantesCurso(data);
      setCursoViendo(cursoId);
    } catch (err) {
      alert(err.message);
    }
  };

  // FUNCIONES DEL MODAL
  const abrirModalCalificar = (matricula) => {
    setEstudianteACalificar({
      id: matricula.id,
      nombre: `${matricula.estudiante?.nombre || matricula.Usuario?.nombre} ${matricula.estudiante?.apellido || matricula.Usuario?.apellido}`
    });
    setNotaTemporal(matricula.nota || ''); // Si ya tiene nota, la mostramos para editarla
  };

  const guardarNota = async () => {
    if (!notaTemporal.trim()) return; // No guardamos si está vacío

    try {
      await asignarNota(estudianteACalificar.id, notaTemporal);
      
      // Actualizamos la lista de estudiantes por debajo
      const data = await obtenerEstudiantesDeCurso(cursoViendo);
      setEstudiantesCurso(data);
      
      // Cerramos el modal
      setEstudianteACalificar(null);
      setNotaTemporal('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Panel de Control (LMS)</h1>
            <p className="text-sm text-blue-600 font-semibold mt-1">
              Sesión iniciada como: {rolUsuario ? rolUsuario.toUpperCase() : 'Desconocido'}
            </p>
          </div>
          <button 
            onClick={handleCerrarSesion}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* MENÚ DE PESTAÑAS (Solo visible para estudiantes) */}
        {esEstudiante && (
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={() => setVistaActual('catalogo')}
              className={`px-6 py-2 rounded-t-lg font-bold transition ${vistaActual === 'catalogo' ? 'bg-white text-blue-600 border-t-4 border-blue-600 shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
            >
              Catálogo de Cursos
            </button>
            <button 
              onClick={() => setVistaActual('misCursos')}
              className={`px-6 py-2 rounded-t-lg font-bold transition ${vistaActual === 'misCursos' ? 'bg-white text-blue-600 border-t-4 border-blue-600 shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
            >
              Mis Cursos
            </button>
          </div>
        )}

        {/* VISTA: MIS CURSOS (Solo Estudiantes) */}
        {vistaActual === 'misCursos' && esEstudiante && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Mis Cursos Inscritos</h2>
            {misCursos.length === 0 ? (
              <p className="text-gray-500">No estás inscrito en ningún curso todavía. ¡Ve al catálogo y matricúlate!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {misCursos.map((mat) => (
                  <div key={mat.id} className="border-2 border-blue-100 rounded-lg p-5 bg-blue-50 hover:shadow-lg transition flex flex-col">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">{mat.curso?.titulo || mat.Curso?.titulo || 'Curso sin nombre'}</h3>
                    <p className="text-gray-600 text-sm mb-4">{mat.curso?.descripcion || mat.Curso?.descripcion || 'Sin descripción'}</p>
                    
                    <div className="bg-white p-3 rounded border border-blue-100 mt-auto flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Estado:</p>
                        <p className="text-sm font-semibold text-green-600">✅ Activa</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Calificación:</p>
                        <p className={`text-lg font-bold ${mat.nota ? 'text-blue-700' : 'text-gray-400'}`}>
                          {mat.nota || 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISTA: CATÁLOGO DE CURSOS */}
        {vistaActual === 'catalogo' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-700">Catálogo General</h2>
              
              {puedeCrearCursos && (
                <button 
                  onClick={() => setMostrarFormulario(!mostrarFormulario)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                >
                  {mostrarFormulario ? 'Cancelar' : '+ Nuevo Curso'}
                </button>
              )}
            </div>

            {/* Formulario Crear Curso */}
            {mostrarFormulario && puedeCrearCursos && (
              <form onSubmit={handleCrearCurso} className="mb-8 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">Detalles del Nuevo Curso</h3>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Título del curso" 
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Breve descripción..." 
                    value={nuevaDescripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    className="flex-2 w-1/2 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <button type="submit" className="bg-green-600 text-white font-bold px-6 py-2 rounded hover:bg-green-700">
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* Lista del Catálogo */}
            {cargando && <p className="text-gray-500">Cargando cursos...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!cargando && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursos.map((curso) => (
                  <div key={curso.id} className="border rounded-lg p-5 hover:shadow-lg transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-blue-600">{curso.titulo}</h3>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${curso.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {curso.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                    </div>
                    
                    {/* Botón para Estudiantes */}
                    {esEstudiante && curso.estado && (
                      <button 
                        onClick={() => handleMatricular(curso.id)}
                        className="w-full mt-4 bg-blue-50 text-blue-600 font-semibold py-2 rounded border border-blue-200 hover:bg-blue-600 hover:text-white transition"
                      >
                        Inscribirse al Curso
                      </button>
                    )}

                    {/* Botón para Profesores/Admins */}
                    {puedeVerEstudiantes && (
                      <button 
                        onClick={() => handleVerEstudiantes(curso.id)}
                        className="w-full mt-4 bg-gray-50 text-gray-700 font-semibold py-2 rounded border border-gray-300 hover:bg-gray-200 transition"
                      >
                        {cursoViendo === curso.id ? 'Ocultar Estudiantes' : 'Ver Estudiantes'}
                      </button>
                    )}

                    {/* Lista Desplegable de Estudiantes con Calificación */}
                    {cursoViendo === curso.id && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <h4 className="text-sm font-bold text-blue-800 mb-3">Alumnos Matriculados:</h4>
                        {estudiantesCurso.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">No hay alumnos inscritos aún.</p>
                        ) : (
                          <ul className="text-sm text-gray-700 space-y-2">
                            {estudiantesCurso.map((mat) => (
                              <li key={mat.id} className="flex flex-col gap-2 border-b border-blue-200 pb-2">
                                <span className="font-semibold">👤 {mat.estudiante?.nombre || mat.Usuario?.nombre} {mat.estudiante?.apellido || mat.Usuario?.apellido}</span>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-xs bg-white border px-2 py-1 rounded shadow-sm">
                                    Nota actual: <span className="font-bold text-blue-700">{mat.nota || 'Sin calificar'}</span>
                                  </span>
                                  
                                  <button 
                                    onClick={() => abrirModalCalificar(mat)}
                                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded transition"
                                  >
                                    ✏️ Calificar
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {cursos.length === 0 && (
                  <p className="text-gray-500 col-span-full">No hay cursos disponibles en el catálogo.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL ANIMADO DE CALIFICACIÓN             */}
      {/* ========================================= */}
      {estudianteACalificar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Asignar Calificación</h3>
              <button onClick={() => setEstudianteACalificar(null)} className="text-gray-400 hover:text-red-500 text-xl font-bold">&times;</button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              Evaluando a: <span className="font-bold text-blue-600">{estudianteACalificar.nombre}</span>
            </p>
            
            <input 
              type="text" 
              placeholder="Ej. 95, Aprobado, A+" 
              value={notaTemporal}
              onChange={(e) => setNotaTemporal(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-6 text-lg"
              autoFocus
            />
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setEstudianteACalificar(null)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition font-semibold"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarNota}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-md transition"
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};