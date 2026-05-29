const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Matricula = require('./Matricula');
const Evaluacion = require('./Evaluacion');


Usuario.hasMany(Curso, { foreignKey: 'profesor_id', as: 'cursosImpartidos' });
Curso.belongsTo(Usuario, { foreignKey: 'profesor_id', as: 'profesor' });


Usuario.belongsToMany(Curso, { through: Matricula, foreignKey: 'estudiante_id', as: 'cursosInscritos' });
Curso.belongsToMany(Usuario, { through: Matricula, foreignKey: 'curso_id', as: 'estudiantes' });


Usuario.hasMany(Matricula, { foreignKey: 'estudiante_id' });
Matricula.belongsTo(Usuario, { foreignKey: 'estudiante_id', as: 'estudiante' });

Curso.hasMany(Matricula, { foreignKey: 'curso_id' });
Matricula.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });


Matricula.hasMany(Evaluacion, { foreignKey: 'matricula_id', as: 'evaluaciones' });
Evaluacion.belongsTo(Matricula, { foreignKey: 'matricula_id', as: 'matricula' });


module.exports = {
  Usuario,
  Curso,
  Matricula,
  Evaluacion
};