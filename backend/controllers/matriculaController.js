const { Matricula, Curso, Usuario } = require('../models');

// Función 1: Matricular Estudiante
const matricularEstudiante = async (req, res) => {
  try {
    const { curso_id, estudiante_id } = req.body;

    // Permitimos que un admin pase el estudiante_id por el body.
    // Si no lo pasan (ej. es el propio estudiante matriculándose), tomamos su ID del token.
    const idEstudiante = estudiante_id || req.usuario.id;

    // 1. Verificar si la matrícula ya existe
    const matriculaExistente = await Matricula.findOne({
      where: {
        curso_id: curso_id,
        estudiante_id: idEstudiante
      }
    });

    if (matriculaExistente) {
      return res.status(400).json({ mensaje: 'El estudiante ya está matriculado en este curso.' });
    }

    // 2. Crear la matrícula
    const nuevaMatricula = await Matricula.create({
      curso_id: curso_id,
      estudiante_id: idEstudiante
    });

    res.status(201).json({
      mensaje: 'Matrícula realizada con éxito',
      matricula: nuevaMatricula
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar la matrícula', error: error.message });
  }
};

// Función 2: Obtener Estudiantes de un Curso específico
const obtenerEstudiantesPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    
    const matriculas = await Matricula.findAll({
      where: { curso_id: cursoId },
      include: [{
        model: Usuario,
        as: 'estudiante',
        attributes: ['id', 'nombre', 'apellido', 'email'] 
      }]
    });

    res.status(200).json(matriculas);
  } catch (error) {
 // 👇 AÑADE ESTA LÍNEA PARA VER EL CHISME COMPLETO 👇
    console.error("🔴 ERROR REAL EN SEQUELIZE:", error); 
    
    res.status(500).json({ mensaje: 'Error al obtener estudiantes', error: error.message });
  }
};
const obtenerMisCursos = async (req, res) => {
  try {
    const estudianteId = req.usuario.id;
    
    const misMatriculas = await Matricula.findAll({
      where: { estudiante_id: estudianteId },
      include: [{
        model: Curso,
        // Recuerda usar el alias correcto aquí si lo configuraste en models/index.js
        as: 'curso', 
        attributes: ['id', 'titulo', 'descripcion']
      }]
    });

    res.status(200).json(misMatriculas);
  } catch (error) {
    console.error("🔴 ERROR EN OBTENER MIS CURSOS:", error);
    res.status(500).json({ mensaje: 'Error al obtener tus cursos', error: error.message });
  }
};

// 2. AL FINAL exportamos todas las funciones juntas
module.exports = { 
  matricularEstudiante,
  obtenerEstudiantesPorCurso,
  obtenerMisCursos // <-- Ahora sí la encontrará sin problemas
};