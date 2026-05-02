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
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: 900; }
          .invoice-info { text-align: right; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .details-grid h3 { font-size: 14px; color: #888; text-transform: uppercase; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { background: #f9f9f9; text-align: left; padding: 12px; border-bottom: 2px solid #eee; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .totals { margin-left: auto; width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: 900; font-size: 18px; }
          .footer { margin-top: 60px; font-size: 12px; color: #888; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SHOP.CO</div>
          <div class="invoice-info">
            <h2 style="margin: 0; font-size: 28px;">INVOICE</h2>
            <p>Order ID: #${order.id.toString().slice(-8).toUpperCase()}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <h3>From</h3>
            <p><strong>SHOP.CO Marketplace</strong></p>
            <p>123 Commerce Way, Tech Hub</p>
            <p>Bangalore, 560001</p>
          </div>
          <div>
            <h3>Billed To</h3>
            <p><strong>${order.User?.name}</strong></p>
            <p>${order.shippingAddress}</p>
            <p>Zip: ${order.zipcode}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.OrderItems.map(item => `
              <tr>
                <td><strong>${item.Product?.name}</strong><br><small>${item.size} / ${item.color}</small></td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>₹${order.totalAmount}</span></div>
          <div class="total-row"><span>Shipping</span><span>₹0.00</span></div>
          <div class="total-row grand-total"><span>Total</span><span>₹${order.totalAmount}</span></div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase! This is a computer generated invoice.</p>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id.toString().slice(-8)}.pdf`);
      res.send(pdfBuffer);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error generating invoice for ID:', req.params.id, error);
    res.status(500).send('Error generating invoice');
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
    await Notification.create({
      userId: order.userId,
      role: 'customer',
      title: 'Order Cancelled',
      message: `Your order #${order.id.toString().slice(-8).toUpperCase()} has been cancelled and stock has been restored.`,
      type: 'order',
      actorId: req.user.id,
      metadata: { orderId: order.id }
    });

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
