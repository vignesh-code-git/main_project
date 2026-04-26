const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = ProductImage;
