const { Notification } = require('../models/associations');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  try {
    const { role, id } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: {
        [Op.or]: [
          { userId: id }, // Direct notifications to this user
          {
            userId: null,
            role: role,
            actorId: { [Op.ne]: id } // Role-based global notifications (exclude self-triggered)
          }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      notifications: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, {
      where: { userId: req.user.id, isRead: false }
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markIndividualAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update({ isRead: true }, {
      where: { id, userId: req.user.id }
    });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Internal helper to create notification
exports.createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
