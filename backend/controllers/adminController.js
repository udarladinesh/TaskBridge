const User = require('../models/User');
const Task = require('../models/Task');
const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('../utils/notificationHelper');

// @desc    Get admin platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalTasks = await Task.countDocuments();
    const openTasks = await Task.countDocuments({ status: 'OPEN' });
    const completedTasks = await Task.countDocuments({ status: 'COMPLETED' });
    const disputedTasks = await Task.countDocuments({ status: 'DISPUTED' });
    const totalReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalTasks,
        openTasks,
        completedTasks,
        disputedTasks,
        totalReports
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active state
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate an admin account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all disputed tasks
// @route   GET /api/admin/disputes
// @access  Private/Admin
exports.getDisputedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'DISPUTED' })
      .populate('requester', 'name email profileImage')
      .populate('tasker', 'name email profileImage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve disputed task (admin ruling with escrow handling)
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Private/Admin
exports.resolveDispute = async (req, res) => {
  try {
    const { resolution } = req.body; // 'complete' | 'cancel'

    if (!resolution || !['complete', 'cancel'].includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: "Resolution must be 'complete' (approve tasker) or 'cancel' (side with requester)"
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'DISPUTED') {
      return res.status(400).json({
        success: false,
        message: `Task is not in DISPUTED status (current: ${task.status})`
      });
    }

    const requester = await User.findById(task.requester);
    const tasker = task.tasker ? await User.findById(task.tasker) : null;

    if (resolution === 'complete') {
      task.status = 'COMPLETED';
      task.completedAt = new Date();

      // Escrow Release to Tasker
      if (task.escrowStatus === 'HELD' && requester && tasker) {
        requester.escrowBalance = Math.max(0, (requester.escrowBalance || 0) - task.rewardAmount);
        tasker.walletBalance = (tasker.walletBalance || 0) + task.rewardAmount;
        task.escrowStatus = 'RELEASED';

        await requester.save();
        await tasker.save();

        await Transaction.create({
          user: requester._id,
          task: task._id,
          type: 'ESCROW_RELEASE',
          amount: -task.rewardAmount,
          balanceAfter: requester.walletBalance,
          description: `Admin dispute ruling: Escrow ₹${task.rewardAmount} released to tasker for "${task.title}"`,
          status: 'COMPLETED'
        });

        await Transaction.create({
          user: tasker._id,
          task: task._id,
          type: 'ESCROW_RELEASE',
          amount: task.rewardAmount,
          balanceAfter: tasker.walletBalance,
          description: `Admin dispute ruling: ₹${task.rewardAmount} credited for completing "${task.title}"`,
          status: 'COMPLETED'
        });
      }
    } else {
      task.status = 'CANCELLED';
      task.cancelledAt = new Date();

      // Escrow Refund to Requester
      if (task.escrowStatus === 'HELD' && requester) {
        requester.escrowBalance = Math.max(0, (requester.escrowBalance || 0) - task.rewardAmount);
        requester.walletBalance = (requester.walletBalance || 0) + task.rewardAmount;
        task.escrowStatus = 'REFUNDED';

        await requester.save();

        await Transaction.create({
          user: requester._id,
          task: task._id,
          type: 'ESCROW_REFUND',
          amount: task.rewardAmount,
          balanceAfter: requester.walletBalance,
          description: `Admin dispute ruling: Escrow ₹${task.rewardAmount} refunded for cancelled task "${task.title}"`,
          status: 'COMPLETED'
        });
      }
    }

    task.dispute = {
      ...task.dispute,
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      resolution
    };

    await task.save();

    // Send notifications to both parties
    if (requester) {
      await sendNotification({
        user: requester._id,
        actor: req.user._id,
        task: task._id,
        type: 'DISPUTE_RESOLVED',
        title: 'Dispute Resolved by Admin',
        message: `Admin ruled in favor of ${resolution === 'complete' ? 'completing task' : 'refunding requester'} for "${task.title}".`,
        link: `/tasks/${task._id}`
      });
    }

    if (tasker) {
      await sendNotification({
        user: tasker._id,
        actor: req.user._id,
        task: task._id,
        type: 'DISPUTE_RESOLVED',
        title: 'Dispute Resolved by Admin',
        message: `Admin ruled in favor of ${resolution === 'complete' ? 'approving submission' : 'cancelling task'} for "${task.title}".`,
        link: `/tasks/${task._id}`
      });
    }

    res.json({
      success: true,
      message: `Dispute resolved. Task marked ${task.status}.`,
      task
    });
  } catch (error) {
    console.error('Resolve Dispute Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
