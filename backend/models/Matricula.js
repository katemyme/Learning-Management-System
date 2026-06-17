const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Matricula = sequelize.define('Matricula', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  nota_semestre: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
}, {
  tableName: 'Matriculas',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['estudiante_id', 'curso_id'] }
  ]
});

module.exports = Matricula;
