const Notification = require('../models/Notification');

/**
 * Dispatch an in-app notification safely
 */
const sendNotification = async ({
  user,
  actor = null,
  task = null,
  type,
  title,
  message,
  link = ''
}) => {
  try {
    if (!user) return null;

    // Don't notify if user is performing the action on themselves
    if (actor && actor.toString() === user.toString()) {
      return null;
    }

    const notification = await Notification.create({
      user,
      actor,
      task,
      type,
      title,
      message,
      link
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = {
  sendNotification
};
