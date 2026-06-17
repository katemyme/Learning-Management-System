const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Evaluacion = sequelize.define('Evaluacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  semana: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  numero_corte: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 3 },
  },
}, {
  tableName: 'Evaluaciones',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['curso_id', 'semana', 'numero_corte', 'titulo'] }
  ]
});

module.exports = Evaluacion;
