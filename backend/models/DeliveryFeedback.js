const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryFeedback = sequelize.define('DeliveryFeedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  courierBehavior: {
    type: DataTypes.STRING,
  },
  comment: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = DeliveryFeedback;
