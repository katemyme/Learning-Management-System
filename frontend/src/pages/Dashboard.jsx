import { useEffect, useState, useCallback } from 'react'; // <-- 1. Importamos useCallback
import { useNavigate } from 'react-router-dom';
import { obtenerCursos, crearCurso } from '../services/cursoService';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');

  const obtenerRol = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol;
    } catch { // <-- 2. FIX: Quitamos la 'e' porque no la usamos
      return null;
    }
  };

  const rolUsuario = obtenerRol();
  const puedeCrear = rolUsuario === 'admin' || rolUsuario === 'profesor';

  // 3. FIX: Envolvemos cargarDatos en useCallback para proteger el rendimiento
  const cargarDatos = useCallback(async () => {
    try {
      const data = await obtenerCursos();
      setCursos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []); // Las dependencias vacías indican que esta función no cambia
// eslint-disable-next-line
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]); // Agregamos cargarDatos al array de dependencias de useEffect

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-700">Catálogo de Cursos</h2>
            
            {puedeCrear && (
              <button 
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
              >
                {mostrarFormulario ? 'Cancelar' : '+ Nuevo Curso'}
              </button>
            )}
          </div>

          {mostrarFormulario && puedeCrear && (
            <form onSubmit={handleCrearCurso} className="mb-8 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-800 mb-3">Detalles del Nuevo Curso</h3>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Título del curso (Ej. Matemáticas Básicas)" 
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

          {cargando && <p className="text-gray-500">Cargando cursos...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!cargando && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((curso) => (
                <div key={curso.id} className="border rounded-lg p-5 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-blue-600">{curso.titulo}</h3>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${curso.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {curso.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
                </div>
              ))}
              
              {cursos.length === 0 && (
                <p className="text-gray-500 col-span-full">No hay cursos disponibles en este momento.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};