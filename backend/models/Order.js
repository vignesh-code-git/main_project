const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'),
    defaultValue: 'Pending'
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  zipcode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
    defaultValue: 'Pending'
  }
});

module.exports = Order;
