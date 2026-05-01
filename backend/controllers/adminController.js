const { User, Product, WebsiteSettings } = require('../models/associations');

// @desc    Get all users (customers)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'customer' },
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private/Admin
const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: 'seller' },
      attributes: { exclude: ['password'] }
    });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get website settings
// @route   GET /api/admin/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settings = await WebsiteSettings.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update website settings/images
// @route   POST /api/admin/settings/upload
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const { key } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const value = `/uploads/${req.file.filename}`;

    // Find if setting exists, then update or create
    let setting = await WebsiteSettings.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await WebsiteSettings.create({
        key,
        value,
        type: 'image'
      });
    }

    // Notify all admins about the change
    try {
      const { Notification } = require('../models/associations');
      await Notification.create({
        role: 'admin',
        userId: null, // Global for all admins
        title: 'System Settings Updated',
        message: `Admin setting "${key}" has been updated.`,
        type: 'system',
        actorId: req.user.id,
        metadata: {
          key,
          imageUrl: value
        }
      });
    } catch (notifErr) {
      console.error('Failed to create admin notification:', notifErr);
    }

    res.json({ 
      message: 'Settings updated successfully',
      setting 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllSellers,
  getSettings,
  updateSettings
};
