const { Entrega, Evaluacion, Matricula, Usuario } = require('../models');

// Estudiante entrega texto
const crearEntrega = async (req, res) => {
  try {
    const { evaluacion_id, contenido } = req.body;
    if (!evaluacion_id || !contenido) {
      return res.status(400).json({ mensaje: 'evaluacion_id y contenido son obligatorios.' });
    }

    const evaluacion = await Evaluacion.findByPk(evaluacion_id);
    if (!evaluacion) return res.status(404).json({ mensaje: 'La evaluación no existe.' });

    // Buscar la matrícula del estudiante en ese curso
    const matricula = await Matricula.findOne({
      where: { estudiante_id: req.usuario.id, curso_id: evaluacion.curso_id }
    });
    if (!matricula) return res.status(403).json({ mensaje: 'No estás matriculado en este curso.' });

    const entrega = await Entrega.create({ evaluacion_id, matricula_id: matricula.id, contenido });
    res.status(201).json({ mensaje: 'Entrega registrada con éxito', entrega });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ mensaje: 'Ya enviaste una entrega para esta evaluación.' });
    }
    res.status(500).json({ mensaje: 'Error al registrar la entrega', error: error.message });
  }
};

// Profesor califica una entrega
const calificarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion } = req.body;

    if (calificacion === undefined || calificacion < 0 || calificacion > 100) {
      return res.status(400).json({ mensaje: 'La calificación debe estar entre 0 y 100.' });
    }

    const entrega = await Entrega.findByPk(id);
    if (!entrega) return res.status(404).json({ mensaje: 'Entrega no encontrada.' });

    entrega.calificacion = calificacion;
    await entrega.save();

    // Recalcular nota_semestre de la matricula
    await recalcularNota(entrega.matricula_id);

    res.status(200).json({ mensaje: 'Calificación registrada', entrega });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calificar', error: error.message });
  }
};

// Obtener entregas de una evaluación (para el profesor)
const obtenerEntregasPorEvaluacion = async (req, res) => {
  try {
    const { evaluacionId } = req.params;
    const entregas = await Entrega.findAll({
      where: { evaluacion_id: evaluacionId },
      include: [{
        model: Matricula,
        as: 'matricula',
        include: [{ model: Usuario, as: 'estudiante', attributes: ['id', 'nombre', 'apellido'] }]
      }]
    });
    res.status(200).json(entregas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener entregas', error: error.message });
  }
};

// Obtener la entrega del estudiante logueado para una evaluación
const obtenerMiEntrega = async (req, res) => {
  try {
    const { evaluacionId } = req.params;
    const evaluacion = await Evaluacion.findByPk(evaluacionId);
    if (!evaluacion) return res.status(404).json({ mensaje: 'Evaluación no encontrada.' });

    const matricula = await Matricula.findOne({
      where: { estudiante_id: req.usuario.id, curso_id: evaluacion.curso_id }
    });
    if (!matricula) return res.status(403).json({ mensaje: 'No estás matriculado en este curso.' });

    const entrega = await Entrega.findOne({ where: { evaluacion_id: evaluacionId, matricula_id: matricula.id } });
    res.status(200).json(entrega || null);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tu entrega', error: error.message });
  }
};

// Recalcula nota_semestre como promedio de los promedios por corte
async function recalcularNota(matricula_id) {
  const entregas = await Entrega.findAll({
    where: { matricula_id },
    include: [{ model: Evaluacion, as: 'evaluacion', attributes: ['numero_corte'] }]
  });

  const porCorte = { 1: [], 2: [], 3: [] };
  for (const e of entregas) {
    if (e.calificacion !== null) {
      porCorte[e.evaluacion.numero_corte].push(Number(e.calificacion));
    }
  }

  const promedios = Object.values(porCorte)
    .filter(arr => arr.length > 0)
    .map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);

  if (promedios.length === 0) return;

  const notaFinal = promedios.reduce((a, b) => a + b, 0) / promedios.length;

  await Matricula.update(
    { nota_semestre: parseFloat(notaFinal.toFixed(2)) },
    { where: { id: matricula_id } }
  );
}

module.exports = { crearEntrega, calificarEntrega, obtenerEntregasPorEvaluacion, obtenerMiEntrega };
