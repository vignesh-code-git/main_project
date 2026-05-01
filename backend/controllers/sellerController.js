const { Product, Order, OrderItem, User } = require('../models/associations');
const { Op } = require('sequelize');

exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // 1. Get all products owned by this seller
    const products = await Product.findAll({
      where: { sellerId }
    });

    const productIds = products.map(p => p.id);

    // 2. Get all order items for these products
    const orderItems = await OrderItem.findAll({
      where: {
        productId: { [Op.in]: productIds }
      },
      include: [{
        model: Order,
        attributes: ['id', 'status', 'createdAt', 'userId']
      }]
    });

    // 3. Calculate Stats
    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size;
    const totalCustomers = new Set(orderItems.map(item => item.Order?.userId)).size;
    
    // 4. Low stock activity
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    // 5. Recent Activity Feed
    const recentOrders = [...new Map(orderItems.map(item => [item.orderId, item.Order])).values()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        title: `New order received (#${order.id.slice(0, 8)})`,
        time: order.createdAt,
        type: 'order'
      }));

    const stockAlerts = [
      ...lowStockProducts.map(p => ({ title: `Low stock alert: ${p.name}`, time: new Date(), type: 'alert' })),
      ...outOfStockProducts.map(p => ({ title: `Out of stock: ${p.name}`, time: new Date(), type: 'critical' }))
    ].slice(0, 5);

    const activityFeed = [...recentOrders, ...stockAlerts]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    res.json({
      stats: {
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalCustomers,
        products: products.length
      },
      activity: activityFeed
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};
