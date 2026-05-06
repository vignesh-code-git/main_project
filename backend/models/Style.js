const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Style = sequelize.define('Style', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Style;
