const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WebsiteSettings = sequelize.define('WebsiteSettings', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('image', 'text', 'color'),
    defaultValue: 'image',
  }
});

module.exports = WebsiteSettings;
