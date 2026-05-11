const { Order, OrderItem, Product, ProductImage, User, Notification, Payment } = require('../models/associations');
const puppeteer = require('puppeteer');

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
      const productWithImages = await Product.findByPk(firstItem.id, {
        include: [{ model: ProductImage, as: 'images' }]
      });

      let imageUrl = null;
      if (productWithImages && productWithImages.images) {
        // Try to find image matching the selected color
        const colorMatch = productWithImages.images.find(img => 
          img.color && img.color.toLowerCase() === firstItem.color?.toLowerCase()
        );
        imageUrl = colorMatch ? colorMatch.url : productWithImages.images[0]?.url;
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
            orderId: order.id,
            color: items[0]?.color
          }
        });
      }
    } catch (notifErr) {
      console.error('Failed to create order notifications:', notifErr);
    }

    // Clear the cart
    try {
      await CartItem.destroy({ where: { userId: req.user.id } });
    } catch (cartErr) {
      console.error('Failed to clear cart:', cartErr);
    }

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
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
          limit: 1
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });
    res.json({
      orders,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
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
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });
    res.json({
      orders,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
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
    const sellerId = req.params.sellerId || req.user?.id;
    const { page = 1, limit = 9 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!sellerId) {
      return res.status(400).json({ message: 'Seller ID is required' });
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      include: [
        {
          model: OrderItem,
          required: true,
          include: [
            {
              model: Product,
              required: true,
              where: { sellerId: parseInt(sellerId) },
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        },
        User
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true,
      subQuery: false // Critical for correct joins with pagination
    });

    res.json({
      orders,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
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
        include: [{ 
          model: Product, 
          include: [{ model: ProductImage, as: 'images' }] 
        }]
      });

      let imageUrl = firstItem?.Product?.images?.[0]?.url;
      if (firstItem?.Product?.images && firstItem.color) {
        const colorMatch = firstItem.Product.images.find(img => 
          img.color && img.color.toLowerCase() === firstItem.color.toLowerCase()
        );
        if (colorMatch) imageUrl = colorMatch.url;
      }

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


exports.cancelOrder = async (req, res) => {
  try {
    console.log('Attempting to cancel order ID:', req.params.id);
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem }]
    });

    if (!order) {
      console.log('Order not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found, current status:', order.status);

    // Check if order belongs to user or if user is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation if order is not Shipped, Delivered or already Cancelled
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }

    // 1. Update Order Status
    await order.update({ status: 'Cancelled' });
    console.log('Order status updated to Cancelled');

    // 2. Restore Stock
    if (order.OrderItems) {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          await product.update({
            stock: product.stock + item.quantity
          });
        }
      }
    }

    // 3. Create Notification for Customer
    try {
      const firstItem = await OrderItem.findOne({
        where: { orderId: order.id },
        include: [{ model: Product, include: [{ model: ProductImage, as: 'images' }] }]
      });

      let imageUrl = firstItem?.Product?.images?.[0]?.url;
      if (firstItem?.Product?.images && firstItem.color) {
        const colorMatch = firstItem.Product.images.find(img => 
          img.color && img.color.toLowerCase() === firstItem.color.toLowerCase()
        );
        if (colorMatch) imageUrl = colorMatch.url;
      }

      await Notification.create({
        userId: order.userId,
        role: 'customer',
        title: 'Order Cancelled',
        message: `Your order #${order.id.toString().slice(-8).toUpperCase()} has been cancelled and stock has been restored.`,
        type: 'order',
        actorId: req.user.id,
        metadata: { 
          orderId: order.id,
          imageUrl: imageUrl || '/placeholder.png'
        }
      });
    } catch (notifErr) {
      console.error('Failed to create cancellation notification:', notifErr);
    }

    // 4. Create Notification for Seller(s)
    const sellerIds = new Set();
    if (order.OrderItems) {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        if (product && product.sellerId) sellerIds.add(product.sellerId);
      }
    }

    for (const sId of sellerIds) {
      await Notification.create({
        userId: sId,
        role: 'seller',
        title: 'Order Cancelled by Customer',
        message: `An order containing your products (#${order.id.toString().slice(-8).toUpperCase()}) has been cancelled.`,
        type: 'order',
        actorId: req.user.id,
        metadata: { orderId: order.id }
      });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('CRITICAL ERROR IN cancelOrder for ID:', req.params.id, error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

const { Return, DeliveryFeedback } = require('../models/associations');

exports.createReturn = async (req, res) => {
  try {
    const { orderId, itemIds, reason, comment } = req.body;
    const returnRequest = await Return.create({
      orderId,
      userId: req.user.id,
      itemIds: Array.isArray(itemIds) ? itemIds.join(',') : (itemIds || ''),
      reason,
      comment
    });

    const order = await Order.findByPk(orderId, { include: [OrderItem] });

    // Update Order Status (Wrapped in try-catch to prevent failure if ENUM is still syncing)
    try {
      if (order) {
        order.status = 'Return Requested';
        await order.save();
      }
    } catch (statusError) {
      console.error('Non-critical: Failed to update order status to Return Requested:', statusError.message);
      // We don't throw here so the returnRequest still gets sent to the user
    }

    // Notify Seller
    const sellerIds = new Set();
    if (order && order.OrderItems) {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        if (product && product.sellerId) sellerIds.add(product.sellerId);
      }
    }

    for (const sId of sellerIds) {
      await Notification.create({
        userId: sId,
        role: 'seller',
        title: 'New Return Request',
        message: `A customer has requested a return for order #${orderId.toString().slice(-8).toUpperCase()}.`,
        type: 'order',
        actorId: req.user.id,
        metadata: { orderId, returnId: returnRequest.id }
      });
    }

    res.status(201).json({ message: 'Return request submitted successfully', returnRequest });
  } catch (error) {
    console.error('Error in createReturn:', error);
    res.status(500).json({ 
      message: 'Error submitting return request', 
      details: error.message 
    });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { orderId, rating, courierBehavior, comment } = req.body;
    const feedback = await DeliveryFeedback.create({
      orderId,
      userId: req.user.id,
      rating,
      courierBehavior,
      comment
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};

exports.getSellerReturns = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // 1. Find all orders that contain products from this seller
    const sellerOrderItems = await OrderItem.findAll({
      include: [{
        model: Product,
        where: { sellerId },
        required: true
      }]
    });
    
    const orderIds = [...new Set(sellerOrderItems.map(item => item.orderId))];
    
    if (orderIds.length === 0) {
      return res.json([]);
    }

    // 2. Fetch returns for these orders
    const returns = await Return.findAll({
      where: { orderId: orderIds },
      include: [
        { model: Order },
        { model: User }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(returns);
  } catch (error) {
    console.error('getSellerReturns Error:', error);
    res.status(500).json({ message: 'Error fetching returns' });
  }
};

exports.getSellerFeedback = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // 1. Find all orders that contain products from this seller
    const sellerOrderItems = await OrderItem.findAll({
      include: [{
        model: Product,
        where: { sellerId },
        required: true
      }]
    });
    
    const orderIds = [...new Set(sellerOrderItems.map(item => item.orderId))];
    
    if (orderIds.length === 0) {
      return res.json([]);
    }

    // 2. Fetch feedback for these orders
    const feedback = await DeliveryFeedback.findAll({
      where: { orderId: orderIds },
      include: [
        { model: Order },
        { model: User }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(feedback);
  } catch (error) {
    console.error('getSellerFeedback Error:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User }, // Customer
        { 
          model: OrderItem,
          include: [{
            model: Product,
            include: [{ model: User }] // Seller
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Check if the user requesting is either the customer, or an admin, or one of the sellers
    // Simplified for now: just render it.

    // Group items by seller
    const sellerGroups = {};
    order.OrderItems.forEach(item => {
      const sellerId = item.Product.User ? item.Product.User.id : 'unknown';
      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          sellerInfo: item.Product.User || { storeName: 'SHOP.CO', address: 'Main Warehouse' },
          items: [],
          subtotal: 0
        };
      }
      sellerGroups[sellerId].items.push(item);
      sellerGroups[sellerId].subtotal += (item.price * item.quantity);
    });

    // We will pick the primary seller for the invoice header, or if multiple, just use the first one
    // or SHOP.CO as the marketplace.
    const primarySellerId = Object.keys(sellerGroups)[0];
    const primarySeller = sellerGroups[primarySellerId].sellerInfo;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.id.slice(0,8).toUpperCase()}</title>
      <style>
        body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background: #f8f9fa; }
        .invoice-container { max-width: 800px; margin: 40px auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .invoice-title h1 { margin: 0; font-size: 32px; color: #000; letter-spacing: -1px; }
        .invoice-title p { margin: 4px 0 0; color: #666; font-size: 14px; }
        .store-details { text-align: right; }
        .store-details h2 { margin: 0; font-size: 20px; color: #000; }
        .store-details p { margin: 2px 0; color: #555; font-size: 14px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .billing-info h3, .shipping-info h3 { margin: 0 0 10px; font-size: 16px; color: #000; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .info-block p { margin: 2px 0; font-size: 14px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 12px; background: #f8f9fa; color: #000; font-weight: 600; border-bottom: 2px solid #ddd; font-size: 14px; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { width: 300px; float: right; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .totals-row.grand-total { font-size: 18px; font-weight: 700; border-top: 2px solid #000; padding-top: 12px; margin-top: 12px; }
        .footer { clear: both; margin-top: 60px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
        @media print {
          body { background: #fff; }
          .invoice-container { box-shadow: none; margin: 0; padding: 20px; max-width: 100%; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>Order # ${order.id}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="store-details">
            <h2>${primarySeller.storeName || 'SHOP.CO marketplace'}</h2>
            <p>${primarySeller.address || '123 E-commerce Blvd'}</p>
            <p>${primarySeller.city || 'Tech City'}, ${primarySeller.state || 'State'} ${primarySeller.zipCode || '10001'}</p>
            <p>${primarySeller.country || 'India'}</p>
            <p>Phone: ${primarySeller.phoneNumber || 'N/A'}</p>
            <p>Email: ${primarySeller.email || 'contact@shop.co'}</p>
          </div>
        </div>

        <div class="info-section">
          <div class="info-block billing-info">
            <h3>Bill To</h3>
            <p><strong>${order.User.name}</strong></p>
            <p>${order.User.email}</p>
            <p>${order.User.phoneNumber || ''}</p>
          </div>
          <div class="info-block shipping-info">
            <h3>Ship To</h3>
            <p><strong>${order.User.name}</strong></p>
            <p>${order.shippingAddress.replace(/\\n/g, '<br>')}</p>
            <p>ZIP: ${order.zipcode}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.OrderItems.map(item => `
            <tr>
              <td>
                <strong>${item.Product.name}</strong><br>
                <span style="font-size: 12px; color: #666;">
                  ${item.color ? 'Color: ' + item.color : ''}
                  ${item.size ? ' | Size: ' + item.size : ''}
                  <br>Seller: ${item.Product.User ? item.Product.User.storeName : 'SHOP.CO'}
                </span>
              </td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">₹${parseFloat(item.price).toFixed(2)}</td>
              <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping</span>
            <span>₹0.00</span>
          </div>
          <div class="totals-row">
            <span>Tax (Included)</span>
            <span>₹0.00</span>
          </div>
          <div class="totals-row grand-total">
            <span>Total</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
          <div class="totals-row" style="margin-top: 10px; color: #555;">
            <span>Payment Status</span>
            <span style="color: ${order.paymentStatus === 'Paid' ? '#166534' : '#991B1B'}; font-weight: bold;">
              ${order.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact the seller directly.</p>
        </div>
      </div>
      
      <script>
        // Automatically open print dialog
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error('generateInvoice Error:', error);
    res.status(500).send('Error generating invoice');
  }
};
