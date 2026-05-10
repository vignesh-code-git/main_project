const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Review = require('./Review');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const ProductImage = require('./ProductImage');
const Notification = require('./Notification');
const Address = require('./Address');
const CartItem = require('./CartItem');
const WebsiteSettings = require('./WebsiteSettings');
const Payment = require('./Payment');
const Return = require('./Return');
const DeliveryFeedback = require('./DeliveryFeedback');
const Brand = require('./Brand');
const Style = require('./Style');
const Size = require('./Size');
const Color = require('./Color');

// Define associations
User.hasMany(Product, { foreignKey: 'sellerId', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'sellerId' });

Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Product.hasMany(ProductImage, { as: 'images', foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { as: 'ActorNotifications', foreignKey: 'actorId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { as: 'Actor', foreignKey: 'actorId' });

User.hasMany(Address, { foreignKey: 'userId', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// Payment Associations
User.hasMany(Payment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// Return Associations
User.hasMany(Return, { foreignKey: 'userId', onDelete: 'CASCADE' });
Return.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(Return, { foreignKey: 'orderId' });
Return.belongsTo(Order, { foreignKey: 'orderId' });

// Feedback Associations
User.hasMany(DeliveryFeedback, { foreignKey: 'userId', onDelete: 'CASCADE' });
DeliveryFeedback.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(DeliveryFeedback, { foreignKey: 'orderId', onDelete: 'CASCADE' });
DeliveryFeedback.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  User,
  Product,
  Category,
  Review,
  Order,
  OrderItem,
  ProductImage,
  Notification,
  Address,
  CartItem,
  WebsiteSettings,
  Payment,
  Return,
  DeliveryFeedback,
  Brand,
  Style,
  Size,
  Color
};
