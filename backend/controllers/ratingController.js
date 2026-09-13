const Rating = require('../models/Rating');
const Task = require('../models/Task');

// @desc    Submit rating for a completed task
// @route   POST /api/ratings
// @access  Private
exports.createRating = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot submit task ratings'
      });
    }

    const { taskId, rating, comment } = req.body;


    if (!taskId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Task ID and rating value (1-5) are required'
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Ratings can only be submitted for COMPLETED tasks'
      });
    }

    const userIdStr = req.user._id.toString();
    const requesterStr = task.requester.toString();
    const taskerStr = task.tasker ? task.tasker.toString() : '';

    let toUser;
    if (userIdStr === requesterStr) {
      toUser = task.tasker;
    } else if (userIdStr === taskerStr) {
      toUser = task.requester;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this task'
      });
    }

    // Check duplicate
    const existing = await Rating.findOne({ task: taskId, fromUser: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a rating for this task'
      });
    }

    const newRating = await Rating.create({
      task: taskId,
      fromUser: req.user._id,
      toUser,
      rating: Number(rating),
      comment: comment || ''
    });

    res.status(201).json({
      success: true,
      rating: newRating
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this task'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user ratings & score summary
// @route   GET /api/ratings/user/:userId
// @access  Public
exports.getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId })
      .populate('fromUser', 'name profileImage')
      .populate('task', 'title category')
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const avgRating =
      totalRatings > 0
        ? (ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
        : 0;

    res.json({
      success: true,
      avgRating: Number(avgRating),
      totalRatings,
      ratings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
