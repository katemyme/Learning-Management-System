const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Curso = sequelize.define('Curso', {
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
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      esDespuesDeInicio(value) {
        if (value && this.fecha_inicio && value < this.fecha_inicio) {
          throw new Error('fecha_fin debe ser igual o posterior a fecha_inicio.');
        }
      }
    }
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  profesor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
  },
}, {
  tableName: 'Cursos',
  timestamps: true
});

module.exports = Curso;
