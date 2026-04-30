const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { role, id } = req.user; // From auth middleware

    const notifications = await Notification.findAll({
      where: {
        [Notification.sequelize.Op.or]: [
          { userId: id },
          { role: role, userId: null } // Global notifications for that role
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json(notifications);
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

// Internal helper to create notification
exports.createNotification = async (data) => {
  try {
    await Notification.create(data);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
