const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    // Ensure it belongs to the user
    if (notification.user.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({ message: 'Server error marking read' });
  }
};

// @route   PATCH /api/notifications/read-all
// @desc    Mark all user notifications as read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
