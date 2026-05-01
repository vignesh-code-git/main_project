const { CartItem, Product, ProductImage } = require('../models/associations');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        include: [{ model: ProductImage, as: 'images', limit: 1 }]
      }]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    
    // Check if item already exists in cart with same size and color
    let item = await CartItem.findOne({
      where: {
        userId: req.user.id,
        productId,
        size,
        color
      }
    });

    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity,
        size,
        color
      });
    }

    // Create Notification
    try {
      const product = await Product.findByPk(productId, {
        include: [{ model: ProductImage, as: 'images', limit: 1 }]
      });
      if (product) {
        const { Notification } = require('../models/associations');
        await Notification.create({
          userId: req.user.id,
          role: req.user.role,
          title: 'Added to Cart',
          message: `"${product.name}" has been added to your shopping cart.`,
          type: 'system',
          actorId: req.user.id,
          metadata: {
            imageUrl: product.images?.[0]?.url,
            productId: product.id
          }
        });
      }
    } catch (notifErr) {
      console.error('Failed to create cart notification:', notifErr);
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity, size, color } = req.body;
    const item = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (size !== undefined) item.size = size;
    if (color !== undefined) item.color = color;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const deleted = await CartItem.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    await CartItem.destroy({
      where: { userId: req.user.id }
    });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
