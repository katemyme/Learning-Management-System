const { Curso } = require('../models');

// ==========================================
// CREAR UN CURSO
// ==========================================
const crearCurso = async (req, res) => {
  try {
    const { titulo, descripcion, estado, profesor_id } = req.body;
    const idProfesor = profesor_id || req.usuario.id;

    const nuevoCurso = await Curso.create({
      titulo,
      descripcion,
      estado,
      profesor_id: idProfesor
    });

    res.status(201).json({ mensaje: 'Curso creado exitosamente', curso: nuevoCurso });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el curso', error: error.message });
  }
};

// ==========================================
// VER TODOS LOS CURSOS
// ==========================================
const obtenerCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll();
    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los cursos', error: error.message });
  }
};

// ==========================================
// ACTUALIZAR UN CURSO (NUEVO)
// ==========================================
const actualizarCurso = async (req, res) => {
  try {
    const { id } = req.params; // Capturamos el ID que viene en la URL
    const { titulo, descripcion, estado } = req.body;

    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ mensaje: 'El curso no existe.' });
    }

    // Actualizamos los campos
    await curso.update({
      titulo: titulo || curso.titulo,
      descripcion: descripcion || curso.descripcion,
      estado: estado !== undefined ? estado : curso.estado
    });

    res.status(200).json({ mensaje: 'Curso actualizado correctamente', curso });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el curso', error: error.message });
  }
};

// ==========================================
// ELIMINAR UN CURSO (NUEVO)
// ==========================================
const eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params;

    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ mensaje: 'El curso no existe.' });
    }

    // Borrado físico de la base de datos
    await curso.destroy();

    res.status(200).json({ mensaje: 'Curso eliminado permanentemente.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el curso', error: error.message });
  }
};

// Asegúrate de exportar las 4 funciones
module.exports = { crearCurso, obtenerCursos, actualizarCurso, eliminarCurso };