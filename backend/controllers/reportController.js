const Report = require('../models/Report');
const Task = require('../models/Task');

// @desc    Report a task for community safety guidelines violation
// @route   POST /api/tasks/:id/report
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please select a reason and provide a description for the report'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const report = await Report.create({
      task: req.params.id,
      reportedBy: req.user._id,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. Safety report submitted for admin review.',
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email')
      .populate('task', 'title status location requester')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
