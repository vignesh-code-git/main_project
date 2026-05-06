const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Size = sequelize.define('Size', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Size;
