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
  }

}, {
  tableName: 'Matriculas',
  timestamps: true
});

module.exports = Matricula;