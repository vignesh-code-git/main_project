const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Color = sequelize.define('Color', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  hexCode: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Color;
