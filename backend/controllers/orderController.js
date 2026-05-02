const { Order, OrderItem, Product, ProductImage, User, Notification, Payment } = require('../models/associations');

exports.createOrder = async (req, res) => {
  try {
    const { userId, totalAmount, shippingAddress, zipcode, items, paymentMethod } = req.body;

    // Map frontend method to Backend ENUM
    const methodMap = {
      'cod': 'COD',
      'card': 'Card',
      'upi': 'UPI',
      'netbanking': 'NetBanking',
      'wallet': 'Wallet'
    };
    const normalizedMethod = methodMap[paymentMethod?.toLowerCase()] || 'Card';

    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      zipcode,
      trackingNumber: 'TCK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      paymentStatus: normalizedMethod === 'COD' ? 'Pending' : 'Paid'
    });

    // Create Payment record
    await Payment.create({
      userId: req.user.id,
      orderId: order.id,
      amount: totalAmount,
      method: normalizedMethod,
      status: normalizedMethod === 'COD' ? 'Pending' : 'Completed',
      gateway: 'Razorpay',
      transactionId: normalizedMethod === 'COD' ? null : 'pay_' + Math.random().toString(36).substr(2, 9)
    });

    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      });
    }
    
    // ... (rest of the notification logic remains same)
    try {
      const firstItem = items[0];
      const productForImage = await Product.findByPk(firstItem.id, {
        include: [{ model: ProductImage, as: 'images', limit: 1 }]
      });
      
      let imageUrl = null;
      if (productForImage && productForImage.images && productForImage.images.length > 0) {
        imageUrl = productForImage.images[0].url;
      }
      
      await Notification.create({
        userId: req.user.id,
        role: 'customer',
        title: 'Order Placed!',
        message: `Your order #${order.id.toString().slice(-8).toUpperCase()} has been placed successfully via ${normalizedMethod === 'COD' ? 'Cash on Delivery' : normalizedMethod}.`,
        type: 'order',
        actorId: req.user.id,
        metadata: {
          imageUrl: imageUrl || '/placeholder.png',
          orderId: order.id,
          productCount: items.length
        }
      });

      const sellerIds = new Set();
      for (const item of items) {
        const product = await Product.findByPk(item.id);
        
        if (product) {
          // 1. Decrement Stock
          const newStock = Math.max(0, product.stock - item.quantity);
          await product.update({ stock: newStock });

          // 2. Check for Low Stock Notification
          if (newStock <= 5 && product.sellerId) {
            const productWithImages = await Product.findByPk(product.id, {
              include: [{ model: ProductImage, as: 'images', limit: 1 }]
            });
            
            await Notification.create({
              userId: product.sellerId,
              role: 'seller',
              title: newStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
              message: newStock === 0 ? `"${product.name}" is now out of stock.` : `Only ${newStock} units left for "${product.name}".`,
              type: 'inventory',
              actorId: req.user.id,
              metadata: {
                imageUrl: productWithImages.images?.[0]?.url,
                productId: product.id,
                currentStock: newStock
              }
            });
          }

          if (product.sellerId) sellerIds.add(product.sellerId);
        }
      }

      for (const sId of sellerIds) {
        await Notification.create({
          userId: sId,
          role: 'seller',
          title: 'New Order Received',
          message: `You have a new order for ${items.length} item(s).`,
          type: 'order',
          actorId: req.user.id,
          metadata: {
            imageUrl: imageUrl || '/placeholder.png', 
            orderId: order.id
          }
        });
      }
    } catch (notifErr) {
      console.error('Failed to create order notifications:', notifErr);
    }

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        },
        {
          model: Payment,
          limit: 1 // Usually one primary payment per order
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        },
        User
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        },
        {
          model: Payment,
          limit: 1
        },
        User
      ]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;
    console.log('Fetching orders for sellerId:', sellerId);
    
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              where: { sellerId: sellerId },
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        },
        User
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter out orders that don't have any items for this seller 
    // (though the JOIN should have done this, sometimes associations are tricky)
    const filteredOrders = orders.filter(order => order.OrderItems && order.OrderItems.length > 0);

    console.log(`Found ${filteredOrders.length} orders for seller`);
    res.json(filteredOrders);
  } catch (error) {
    console.error('getSellerOrders Error:', error);
    res.status(500).json({ message: 'Error fetching seller orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    // Create Notification for User
    try {
      const firstItem = await OrderItem.findOne({
        where: { orderId: order.id },
        include: [{ model: Product, include: [{ model: ProductImage, as: 'images', limit: 1 }] }]
      });

      const imageUrl = firstItem?.Product?.images?.[0]?.url;

      await Notification.create({
        userId: order.userId,
        role: 'customer',
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your order #${order.id.toString().slice(-8).toUpperCase()} status has been updated to ${status}.`,
        type: 'order',
        actorId: req.user.id,
        metadata: {
          imageUrl,
          orderId: order.id,
          status: status
        }
      });
    } catch (notifErr) {
      console.error('Failed to create status notification:', notifErr);
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        User
      ]
    });

    if (!order) return res.status(404).send('Order not found');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - SHOP.CO</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .logo { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
          .invoice-details { text-align: right; }
          .invoice-details h2 { margin: 0; color: #000; font-size: 32px; }
          .invoice-details p { margin: 4px 0; color: #666; font-size: 14px; }
          
          .billing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .billing-info h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 12px; }
          .billing-info p { margin: 4px 0; font-size: 15px; line-height: 1.4; }

          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-bottom: 40px; }
          table th { background: #000; color: #fff; padding: 12px; font-size: 13px; text-transform: uppercase; }
          table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 15px; }
          
          .totals { margin-left: auto; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .total-row.grand-total { border-bottom: none; font-weight: 900; font-size: 20px; color: #000; padding-top: 16px; }
          
          .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          @media print { .print-btn { display: none; } }
          .print-btn { background: #000; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 700; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print Invoice</button>
        
        <div class="header">
          <div class="logo">SHOP.CO</div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p>Order ID: #${order.id.toString().slice(-8).toUpperCase()}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="billing-grid">
          <div class="billing-info">
            <h3>Billed From</h3>
            <p><strong>SHOP.CO Marketplace</strong></p>
            <p>123 Commerce Way</p>
            <p>Tech Hub, Bangalore - 560001</p>
            <p>GSTIN: 29ABCDE1234F1Z5</p>
          </div>
          <div class="billing-info">
            <h3>Billed To</h3>
            <p><strong>${order.User?.name}</strong></p>
            <p>${order.shippingAddress}</p>
            <p>Zip Code: ${order.zipcode}</p>
            <p>${order.User?.email}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.OrderItems.map(item => `
              <tr>
                <td><strong>${item.Product?.name}</strong><br><small>Size: ${item.size}, Color: ${item.color}</small></td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>₹${order.totalAmount}</span>
          </div>
          <div class="total-row">
            <span>Shipping</span>
            <span>₹0.00</span>
          </div>
          <div class="total-row">
            <span>Tax (Included)</span>
            <span>₹0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>₹${order.totalAmount}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with SHOP.CO!</p>
          <p>If you have any questions about this invoice, please contact support@shop.co</p>
        </div>
      </body>
      </html>
    `;

    res.send(invoiceHtml);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating invoice');
  }
};
