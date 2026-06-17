const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Entrega = sequelize.define('Entrega', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: { min: 0, max: 100 },
  },
}, {
  tableName: 'Entregas',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['evaluacion_id', 'matricula_id'] }
  ]
});

module.exports = Entrega;
