const { Matricula, Curso, Usuario } = require('../models');

const matricularEstudiante = async (req, res) => {
  try {
    const { curso_id, estudiante_id } = req.body;
    const idEstudiante = estudiante_id || req.usuario.id;

    const nuevaMatricula = await Matricula.create({
      curso_id,
      estudiante_id: idEstudiante
    });

    res.status(201).json({ mensaje: 'Matrícula realizada con éxito', matricula: nuevaMatricula });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ mensaje: 'El estudiante ya está matriculado en este curso.' });
    }
    res.status(500).json({ mensaje: 'Error al procesar la matrícula', error: error.message });
  }
};

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
        as: 'curso',
        attributes: ['id', 'titulo', 'descripcion']
      }]
    });

    res.status(200).json(misMatriculas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tus cursos', error: error.message });
  }
};

const asignarNota = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota } = req.body;

    const matricula = await Matricula.findByPk(id);
    if (!matricula) {
      return res.status(404).json({ mensaje: 'Matrícula no encontrada' });
    }

    matricula.nota_semestre = nota;
    await matricula.save();

    res.status(200).json({ mensaje: 'Nota asignada correctamente', matricula });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar la nota', error: error.message });
  }
};

module.exports = { matricularEstudiante, asignarNota, obtenerEstudiantesPorCurso, obtenerMisCursos };
