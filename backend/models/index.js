const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Matricula = require('./Matricula');
const Evaluacion = require('./Evaluacion');
const Entrega = require('./Entrega');

// Profesor → Cursos
Usuario.hasMany(Curso, { foreignKey: 'profesor_id', as: 'cursosImpartidos', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Curso.belongsTo(Usuario, { foreignKey: 'profesor_id', as: 'profesor', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Estudiante → Matrículas
Usuario.hasMany(Matricula, { foreignKey: 'estudiante_id', as: 'matriculas', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Matricula.belongsTo(Usuario, { foreignKey: 'estudiante_id', as: 'estudiante', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Curso → Matrículas
Curso.hasMany(Matricula, { foreignKey: 'curso_id', as: 'matriculas', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Matricula.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Curso → Evaluaciones
Curso.hasMany(Evaluacion, { foreignKey: 'curso_id', as: 'evaluaciones', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Evaluacion.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Evaluacion → Entregas
Evaluacion.hasMany(Entrega, { foreignKey: 'evaluacion_id', as: 'entregas', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Entrega.belongsTo(Evaluacion, { foreignKey: 'evaluacion_id', as: 'evaluacion', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Matricula → Entregas
Matricula.hasMany(Entrega, { foreignKey: 'matricula_id', as: 'entregas', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Entrega.belongsTo(Matricula, { foreignKey: 'matricula_id', as: 'matricula', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = { Usuario, Curso, Matricula, Evaluacion, Entrega };
