const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Matricula = require('./Matricula');
const Evaluacion = require('./Evaluacion');

// Profesor → Cursos
Usuario.hasMany(Curso, { foreignKey: 'profesor_id', as: 'cursosImpartidos', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Curso.belongsTo(Usuario, { foreignKey: 'profesor_id', as: 'profesor', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Estudiante → Matrículas
Usuario.hasMany(Matricula, { foreignKey: 'estudiante_id', as: 'matriculas', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Matricula.belongsTo(Usuario, { foreignKey: 'estudiante_id', as: 'estudiante', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Curso → Matrículas
Curso.hasMany(Matricula, { foreignKey: 'curso_id', as: 'matriculas', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Matricula.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Matrícula → Evaluaciones
Matricula.hasMany(Evaluacion, { foreignKey: 'matricula_id', as: 'evaluaciones', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Evaluacion.belongsTo(Matricula, { foreignKey: 'matricula_id', as: 'matricula', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = {
  Usuario,
  Curso,
  Matricula,
  Evaluacion
};
