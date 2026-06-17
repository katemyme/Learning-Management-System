import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registro } from '../services/authService';

const ROLES = [
  { value: 'estudiante', label: 'Estudiante', icon: '🎓' },
  { value: 'profesor',   label: 'Profesor',   icon: '📖' },
  { value: 'admin',      label: 'Administrador', icon: '⚙️' },
];

export const Registro = () => {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'estudiante' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registro(formData.nombre, formData.apellido, formData.email, formData.password, formData.rol);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">

        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500 shadow-lg shadow-purple-500/40 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="text-indigo-300 mt-1 text-sm">Únete a la plataforma LMS</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-slide-up-1">

          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 rounded-xl mb-5 text-sm animate-slide-down">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3 animate-slide-up-1">
              <div className="w-1/2">
                <label className="block text-indigo-200 text-sm font-medium mb-2">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Juan" required className={inputClass} />
              </div>
              <div className="w-1/2">
                <label className="block text-indigo-200 text-sm font-medium mb-2">Apellido</label>
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Pérez" required className={inputClass} />
              </div>
            </div>

            <div className="animate-slide-up-2">
              <label className="block text-indigo-200 text-sm font-medium mb-2">Correo electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@correo.com" required className={inputClass} />
            </div>

            <div className="animate-slide-up-3">
              <label className="block text-indigo-200 text-sm font-medium mb-2">Contraseña</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className={inputClass} />
            </div>

            <div className="animate-slide-up-4">
              <label className="block text-indigo-200 text-sm font-medium mb-3">Rol</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, rol: r.value })}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      formData.rol === r.value
                        ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/5 border-white/15 text-indigo-200 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 animate-slide-up-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-400/40 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-indigo-300 text-sm mt-6 animate-slide-up-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/" className="text-white font-semibold hover:text-indigo-200 transition-colors duration-200 underline underline-offset-2">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};
