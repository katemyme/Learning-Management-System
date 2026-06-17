const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(55),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(55),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  password_hash: {  
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {   
      isIn: {
        args: [['admin', 'profesor', 'estudiante']],
        msg: "El rol debe ser 'admin', 'profesor' o 'estudiante'" 
      }
    }
  }
}, {
  tableName: 'Usuarios',
  timestamps: true,
  createdAt: 'fecha_registro',
  updatedAt: 'updatedAt',
  indexes: [
    { unique: true, fields: ['email'] }
  ]
});

module.exports = Usuario;