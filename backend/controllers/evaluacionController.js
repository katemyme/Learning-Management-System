const { Evaluacion, Matricula } = require('../models');

// Crear una evaluación (Profesor/Admin)
const crearEvaluacion = async (req, res) => {
  try {
    const { matricula_id, numero_corte, calificacion, fecha_realizacion, observacion } = req.body;

    const matriculaExistente = await Matricula.findByPk(matricula_id);
    if (!matriculaExistente) {
      return res.status(404).json({ mensaje: 'La matrícula especificada no existe.' });
    }

    const nuevaEvaluacion = await Evaluacion.create({ matricula_id, numero_corte, calificacion, fecha_realizacion, observacion });
    res.status(201).json({ text: 'Evaluación registrada con éxito', evaluacion: nuevaEvaluacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar la evaluación', error: error.message });
  }
};

// Ver todas las evaluaciones (Admin/Profesor)
const obtenerEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await Evaluacion.findAll();
    res.status(200).json(evaluaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las evaluaciones', error: error.message });
  }
};

// Actualizar una calificación u observación (Admin/Profesor)
const actualizarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion, observacion } = req.body;

    const evaluacion = await Evaluacion.findByPk(id);
    if (!evaluacion) {
      return res.status(404).json({ mensaje: 'La evaluación no existe.' });
    }

    await evaluacion.update({
      calificacion: calificacion !== undefined ? calificacion : evaluacion.calificacion,
      observacion: observacion || evaluacion.observacion
    });

    res.status(200).json({ mensaje: 'Evaluación modificada correctamente', evaluacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar la evaluación', error: error.message });
  }
};

// Eliminar una evaluación (Admin/Profesor)
const eliminarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluacion = await Evaluacion.findByPk(id);
    if (!evaluacion) {
      return res.status(404).json({ mensaje: 'La evaluación no existe.' });
    }

    await evaluacion.destroy();
    res.status(200).json({ mensaje: 'Evaluación eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la evaluación', error: error.message });
  }
};

module.exports = { crearEvaluacion, obtenerEvaluaciones, actualizarEvaluacion, eliminarEvaluacion };