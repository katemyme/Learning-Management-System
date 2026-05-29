require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const { Usuario, Curso, Matricula, Evaluacion } = require('./models');

// 1. Importar Rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // <-- NUEVO
const cursoRoutes = require('./routes/cursoRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');
const evaluacionRoutes = require('./routes/evaluacionRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 2. Montar las rutas en sus endpoints
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); // <-- NUEVO
app.use('/api/cursos', cursoRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);

// Función para iniciar el servidor
const iniciarServidor = async () => {
  try {
    await sequelize.sync(); // Sin parámetros para evitar conflictos con SQL Server
    console.log('✅ Base de datos sincronizada correctamente.');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
  }
};

iniciarServidor();