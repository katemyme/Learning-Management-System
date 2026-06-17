const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Evaluacion = sequelize.define('Evaluacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero_corte: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  fecha_realizacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  observacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'Evaluaciones',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['matricula_id', 'numero_corte'] }
  ]
});

module.exports = Evaluacion;
