const { Matricula, Curso, Usuario } = require('../models');

// ==========================================
// MATRICULAR A UN ESTUDIANTE EN UN CURSO
// ==========================================
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

module.exports = { matricularEstudiante };