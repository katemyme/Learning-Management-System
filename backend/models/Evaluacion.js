const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Evaluacion = sequelize.define('Evaluacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  calificacion: {
    type: DataTypes.DECIMAL(5, 2), 
    allowNull: false,
  },
  observacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
  
}, {
  tableName: 'Evaluaciones',
  timestamps: true
});

module.exports = Evaluacion;