const Task = require('../models/Task');
const { scanTaskSafety, verifyTaskProof } = require('../services/aiService');

// @desc    Run real-time AI Safety scan on task parameters
// @route   POST /api/ai/scan-task
// @access  Private
exports.scanTask = async (req, res) => {
  try {
    const { title, description, category, proofRequirement, proofInstructions } = req.body;

    const analysis = scanTaskSafety({
      title,
      description,
      category,
      proofRequirement,
      proofInstructions
    });

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI Scan Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Run automated AI proof verification on a submitted task
// @route   POST /api/ai/verify-proof/:taskId
// @access  Private
exports.analyzeTaskProof = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.submission || !task.submission.submittedAt) {
      return res.status(400).json({
        success: false,
        message: 'Task has no submission to verify'
      });
    }

    const verification = verifyTaskProof({
      task,
      submission: task.submission
    });

    task.aiProofVerification = verification;
    await task.save();

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('AI Verify Proof Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
