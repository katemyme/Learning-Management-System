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
  nota: {
    type: DataTypes.STRING, // Usamos STRING para que el profe pueda poner "95", "A", o "Aprobado"
    allowNull: true         // Al principio es nulo porque el estudiante aún no tiene nota
  }
}, {
  tableName: 'Matriculas',
  timestamps: true
});

module.exports = Matricula;