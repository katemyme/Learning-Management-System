const { Evaluacion, Entrega, Matricula, Curso } = require('../models');

// Crear evaluación para un curso (Profesor/Admin)
const crearEvaluacion = async (req, res) => {
  try {
    const { curso_id, titulo, descripcion, semana, numero_corte } = req.body;

    if (!curso_id || !titulo || !semana || !numero_corte) {
      return res.status(400).json({ mensaje: 'curso_id, titulo, semana y numero_corte son obligatorios.' });
    }

    const curso = await Curso.findByPk(curso_id);
    if (!curso) return res.status(404).json({ mensaje: 'El curso no existe.' });

    const nueva = await Evaluacion.create({ curso_id, titulo, descripcion, semana, numero_corte });
    res.status(201).json({ mensaje: 'Evaluación creada con éxito', evaluacion: nueva });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ mensaje: 'Ya existe una evaluación con ese título en esa semana y corte.' });
    }
    res.status(500).json({ mensaje: 'Error al crear la evaluación', error: error.message });
  }
};

// Obtener evaluaciones de un curso agrupadas por semana
const obtenerEvaluacionesPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const evaluaciones = await Evaluacion.findAll({
      where: { curso_id: cursoId },
      order: [['semana', 'ASC'], ['numero_corte', 'ASC']],
    });
    res.status(200).json(evaluaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener evaluaciones', error: error.message });
  }
};

// Eliminar una evaluación
const eliminarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluacion = await Evaluacion.findByPk(id);
    if (!evaluacion) return res.status(404).json({ mensaje: 'La evaluación no existe.' });
    await evaluacion.destroy();
    res.status(200).json({ mensaje: 'Evaluación eliminada.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la evaluación', error: error.message });
  }
};

module.exports = { crearEvaluacion, obtenerEvaluacionesPorCurso, eliminarEvaluacion };
