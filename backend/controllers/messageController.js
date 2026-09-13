const Message = require('../models/Message');
const Task = require('../models/Task');
const { sendNotification } = require('../utils/notificationHelper');

// @desc    Get all messages for a specific task
// @route   GET /api/tasks/:id/messages
// @access  Private
exports.getTaskMessages = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check authorization: must be requester, assigned tasker, or admin
    const isRequester = task.requester.toString() === req.user._id.toString();
    const isTasker = task.tasker && task.tasker.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isTasker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages for this task'
      });
    }

    const messages = await Message.find({ task: task._id })
      .populate('sender', 'name profileImage role')
      .populate('recipient', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark messages sent to this user as read
    await Message.updateMany(
      { task: task._id, recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message in a task discussion
// @route   POST /api/tasks/:id/messages
// @access  Private
exports.sendTaskMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isRequester = task.requester.toString() === req.user._id.toString();
    const isTasker = task.tasker && task.tasker.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isTasker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester and accepted tasker can send messages in this task chat'
      });
    }

    // Determine recipient
    let recipientId;
    if (isRequester) {
      if (!task.tasker) {
        return res.status(400).json({
          success: false,
          message: 'Cannot send message until a tasker has accepted this task'
        });
      }
      recipientId = task.tasker;
    } else {
      recipientId = task.requester;
    }

    // Handle file attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push(`/uploads/${file.filename}`);
      });
    }

    const message = await Message.create({
      task: task._id,
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
      attachments
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage role')
      .populate('recipient', 'name profileImage');

    // Dispatch real-time in-app notification to recipient
    await sendNotification({
      user: recipientId,
      actor: req.user._id,
      task: task._id,
      type: 'NEW_MESSAGE',
      title: `New message on "${task.title.substring(0, 30)}..."`,
      message: `${req.user.name}: "${text.trim().substring(0, 60)}${text.length > 60 ? '...' : ''}"`,
      link: `/tasks/${task._id}`
    });

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
