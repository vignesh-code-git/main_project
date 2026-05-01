const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Refunded'),
    defaultValue: 'Pending'
  },
  method: {
    type: DataTypes.ENUM('Card', 'UPI', 'NetBanking', 'COD', 'Wallet'),
    allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  gateway: {
    type: DataTypes.STRING, // e.g., 'Razorpay', 'Stripe', 'PayPal'
    allowNull: true
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Payment;
