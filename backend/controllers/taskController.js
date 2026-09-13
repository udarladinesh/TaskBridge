const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('../utils/notificationHelper');
const { scanTaskSafety, verifyTaskProof } = require('../services/aiService');

// Prohibited task keywords for basic safety filtering
const PROHIBITED_KEYWORDS = [
  'weapon',
  'gun',
  'drug',
  'stalk',
  'trespass',
  'break in',
  'steal',
  'hack',
  'impersonate',
  'illegal',
  'spy',
  'wiretap',
  'assault',
  'harass'
];

// Helper to check and mark expired OPEN tasks & refund escrow
const checkTaskExpirations = async (tasks) => {
  const now = new Date();
  if (Array.isArray(tasks)) {
    for (let t of tasks) {
      if (t.status === 'OPEN' && new Date(t.deadline) < now) {
        t.status = 'EXPIRED';
        if (t.escrowStatus === 'HELD') {
          t.escrowStatus = 'REFUNDED';
          const requester = await User.findById(t.requester);
          if (requester) {
            requester.escrowBalance = Math.max(0, (requester.escrowBalance || 0) - t.rewardAmount);
            requester.walletBalance = (requester.walletBalance || 0) + t.rewardAmount;
            await requester.save();

            await Transaction.create({
              user: requester._id,
              task: t._id,
              type: 'ESCROW_REFUND',
              amount: t.rewardAmount,
              balanceAfter: requester.walletBalance,
              description: `Task expired past deadline. Escrow ₹${t.rewardAmount} refunded for "${t.title}"`,
              status: 'COMPLETED'
            });

            await sendNotification({
              user: requester._id,
              task: t._id,
              type: 'SYSTEM_ALERT',
              title: 'Task Expired & Escrow Refunded',
              message: `Your task "${t.title}" has expired without being accepted. ₹${t.rewardAmount} was refunded to your wallet.`,
              link: `/tasks/${t._id}`
            });
          }
        }
        await t.save();
      }
    }
    return tasks;
  } else if (tasks && tasks.status === 'OPEN' && new Date(tasks.deadline) < now) {
    tasks.status = 'EXPIRED';
    if (tasks.escrowStatus === 'HELD') {
      tasks.escrowStatus = 'REFUNDED';
      const requester = await User.findById(tasks.requester);
      if (requester) {
        requester.escrowBalance = Math.max(0, (requester.escrowBalance || 0) - tasks.rewardAmount);
        requester.walletBalance = (requester.walletBalance || 0) + tasks.rewardAmount;
        await requester.save();

        await Transaction.create({
          user: requester._id,
          task: tasks._id,
          type: 'ESCROW_REFUND',
          amount: tasks.rewardAmount,
          balanceAfter: requester.walletBalance,
          description: `Task expired past deadline. Escrow ₹${tasks.rewardAmount} refunded for "${tasks.title}"`,
          status: 'COMPLETED'
        });
      }
    }
    await tasks.save();
    return tasks;
  }
  return tasks;
};

// @desc    Create a new task with escrow locking & AI safety evaluation
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot create or post tasks'
      });
    }

    // Prevent unauthorized task creation if operating in Tasker mode
    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() === 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'Taskers are not authorized to create tasks. Please switch to Requester mode.'
      });
    }


    const {
      title,
      description,
      category,
      location,
      deadline,
      rewardAmount,
      currency,
      proofRequirement,
      proofInstructions
    } = req.body;

    const rewardNum = Number(rewardAmount) || 0;

    // Deadline validation
    if (!deadline || new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be a valid date and time in the future'
      });
    }

    // AI Safety scan
    const aiAnalysis = scanTaskSafety({
      title,
      description,
      category,
      proofRequirement,
      proofInstructions
    });

    if (aiAnalysis.riskLevel === 'HIGH_RISK') {
      return res.status(400).json({
        success: false,
        message: `Task violates community safety guidelines: ${aiAnalysis.flags.join(', ')}`,
        aiAnalysis
      });
    }

    // Escrow check: Verify requester wallet balance
    const requester = await User.findById(req.user._id);
    if (!requester) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if ((requester.walletBalance || 0) < rewardNum) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance (Available: ₹${requester.walletBalance || 0}, Required: ₹${rewardNum}). Please top up your wallet first.`
      });
    }

    // Deduct from walletBalance and lock in escrowBalance
    requester.walletBalance -= rewardNum;
    requester.escrowBalance = (requester.escrowBalance || 0) + rewardNum;
    await requester.save();

    const task = await Task.create({
      title,
      description,
      category,
      location,
      deadline,
      rewardAmount: rewardNum,
      currency: currency || 'INR',
      proofRequirement: proofRequirement || 'photo',
      proofInstructions: proofInstructions || '',
      requester: req.user._id,
      status: 'OPEN',
      escrowStatus: 'HELD',
      aiSafetyScore: {
        score: aiAnalysis.score,
        riskLevel: aiAnalysis.riskLevel,
        feedback: aiAnalysis.feedback
      }
    });

    // Record ESCROW_HOLD transaction
    await Transaction.create({
      user: requester._id,
      task: task._id,
      type: 'ESCROW_HOLD',
      amount: -rewardNum,
      balanceAfter: requester.walletBalance,
      description: `Escrow locked for task "${title}"`,
      status: 'COMPLETED'
    });

    res.status(201).json({
      success: true,
      task,
      walletBalance: requester.walletBalance,
      escrowBalance: requester.escrowBalance,
      aiAnalysis
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Browse & filter tasks
// @route   GET /api/tasks
// @access  Public
exports.getTasks = async (req, res) => {
  try {
    const {
      q,
      category,
      state,
      city,
      locality,
      status,
      minReward,
      maxReward
    } = req.query;

    const query = {};
    query.status = status || 'OPEN';

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.city': searchRegex },
        { 'location.locality': searchRegex },
        { 'location.state': searchRegex }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (state) {
      query['location.state'] = new RegExp(`^${state}$`, 'i');
    }

    if (city) {
      query['location.city'] = new RegExp(`^${city}$`, 'i');
    }

    if (locality) {
      query['location.locality'] = new RegExp(locality, 'i');
    }

    if (minReward || maxReward) {
      query.rewardAmount = {};
      if (minReward) query.rewardAmount.$gte = Number(minReward);
      if (maxReward) query.rewardAmount.$lte = Number(maxReward);
    }

    let tasks = await Task.find(query)
      .populate('requester', 'name email profileImage')
      .populate('tasker', 'name email profileImage')
      .sort({ createdAt: -1 });

    tasks = await checkTaskExpirations(tasks);

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Public
exports.getTaskById = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id)
      .populate('requester', 'name email profileImage bio createdAt')
      .populate('tasker', 'name email profileImage bio createdAt');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await checkTaskExpirations(task);

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's posted tasks
// @route   GET /api/tasks/my-posted
// @access  Private
exports.getMyPostedTasks = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({ success: true, count: 0, tasks: [] });
    }

    let tasks = await Task.find({ requester: req.user._id })
      .populate('tasker', 'name email profileImage')
      .sort({ createdAt: -1 });

    tasks = await checkTaskExpirations(tasks);

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's accepted/working tasks
// @route   GET /api/tasks/my-accepted
// @access  Private
exports.getMyAcceptedTasks = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json({ success: true, count: 0, tasks: [] });
    }

    const tasks = await Task.find({ tasker: req.user._id })
      .populate('requester', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept task (Atomic operation to prevent double acceptance)
// @route   POST /api/tasks/:id/accept
// @access  Private
exports.acceptTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot accept tasks'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() !== 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'You must switch to Tasker mode to accept tasks.'
      });
    }

    const taskId = req.params.id;

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (existingTask.requester.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot accept your own posted task'
      });
    }

    if (new Date(existingTask.deadline) <= new Date()) {
      existingTask.status = 'EXPIRED';
      await existingTask.save();
      return res.status(400).json({
        success: false,
        message: 'Task deadline has expired and cannot be accepted'
      });
    }

    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: taskId,
        status: 'OPEN',
        deadline: { $gt: new Date() }
      },
      {
        $set: {
          status: 'ACCEPTED',
          tasker: req.user._id,
          acceptedAt: new Date()
        }
      },
      { new: true }
    )
      .populate('requester', 'name email profileImage')
      .populate('tasker', 'name email profileImage');

    if (!updatedTask) {
      return res.status(400).json({
        success: false,
        message: 'Task is no longer available or has already been accepted'
      });
    }

    // Dispatch notification to requester
    await sendNotification({
      user: updatedTask.requester._id,
      actor: req.user._id,
      task: updatedTask._id,
      type: 'TASK_ACCEPTED',
      title: 'Task Accepted!',
      message: `${req.user.name} has accepted your task "${updatedTask.title.substring(0, 30)}...".`,
      link: `/tasks/${updatedTask._id}`
    });

    res.json({
      success: true,
      message: 'Task accepted successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Accept Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start task
// @route   POST /api/tasks/:id/start
// @access  Private
exports.startTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot start tasks'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';

    if (activeMode.toLowerCase() !== 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'You must switch to Tasker mode to start tasks.'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.tasker || task.tasker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned tasker can start this task'
      });
    }

    if (task.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot start task with status: ${task.status}`
      });
    }

    task.status = 'IN_PROGRESS';
    task.startedAt = new Date();
    await task.save();

    // Dispatch notification to requester
    await sendNotification({
      user: task.requester,
      actor: req.user._id,
      task: task._id,
      type: 'TASK_STARTED',
      title: 'Task In Progress',
      message: `${req.user.name} has started working on "${task.title.substring(0, 30)}...".`,
      link: `/tasks/${task._id}`
    });

    res.json({
      success: true,
      message: 'Task marked as IN_PROGRESS',
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a submission (proof) to the task  — supports multiple submissions
// @route   POST /api/tasks/:id/submit
// @access  Private
exports.submitTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot submit task proofs'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() !== 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'You must switch to Tasker mode to submit completion proof.'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.tasker || task.tasker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned tasker can submit completion proof'
      });
    }

    const allowedStatuses = ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED'];
    if (!allowedStatuses.includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot add a submission when task status is: ${task.status}`
      });
    }

    const { description } = req.body;
    let proofFiles = [];

    if (req.files && req.files.length > 0) {
      proofFiles = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const submissionData = {
      submittedAt: new Date(),
      description: description || '',
      proofFiles,
      isFinal: false
    };

    // Run AI proof verification for this individual submission
    const aiVerification = verifyTaskProof({
      task,
      submission: submissionData
    });
    submissionData.aiProofVerification = aiVerification;

    // Push into the submissions array
    task.submissions.push(submissionData);

    // Move task to SUBMITTED status on first submission; keep it on subsequent ones
    if (task.status !== 'SUBMITTED') {
      task.status = 'SUBMITTED';
    }

    // Keep the task-level aiProofVerification in sync with the latest submission
    task.aiProofVerification = aiVerification;

    await task.save();

    // Re-populate so the response contains the saved submission _id
    const savedTask = await Task.findById(task._id)
      .populate('requester', 'name email profileImage bio createdAt')
      .populate('tasker', 'name email profileImage bio createdAt');

    // Dispatch notification to requester
    await sendNotification({
      user: task.requester,
      actor: req.user._id,
      task: task._id,
      type: 'TASK_SUBMITTED',
      title: 'New Proof Submitted for Review',
      message: `${req.user.name} has added a new submission for "${task.title.substring(0, 30)}...".`,
      link: `/tasks/${task._id}`
    });

    res.json({
      success: true,
      message: 'Submission added successfully',
      task: savedTask,
      aiVerification
    });
  } catch (error) {
    console.error('Submit Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a specific submission
// @route   DELETE /api/tasks/:id/submissions/:subId
// @access  Private (assigned tasker only, active tasks only)
exports.deleteSubmission = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot delete task submissions'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() !== 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'You must switch to Tasker mode to delete submissions.'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.tasker || task.tasker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned tasker can delete submissions'
      });
    }

    const blockedStatuses = ['COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED'];
    if (blockedStatuses.includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete submissions when task status is: ${task.status}`
      });
    }

    const subId = req.params.subId;
    const submissionIndex = task.submissions.findIndex(
      (s) => s._id.toString() === subId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const wasFinaL = task.submissions[submissionIndex].isFinal;

    // Remove the submission
    task.submissions.splice(submissionIndex, 1);

    if (task.submissions.length === 0) {
      // No submissions left — roll back to IN_PROGRESS
      task.status = 'IN_PROGRESS';
      task.aiProofVerification = undefined;
    } else if (wasFinaL) {
      // The deleted submission was final; clear final status (no auto-selection)
      task.submissions.forEach((s) => { s.isFinal = false; });
      // Update root AI verification to the most recent remaining submission
      const latest = task.submissions[task.submissions.length - 1];
      task.aiProofVerification = latest.aiProofVerification;
    }

    await task.save();

    const savedTask = await Task.findById(task._id)
      .populate('requester', 'name email profileImage bio createdAt')
      .populate('tasker', 'name email profileImage bio createdAt');

    res.json({
      success: true,
      message: 'Submission deleted successfully',
      task: savedTask
    });
  } catch (error) {
    console.error('Delete Submission Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a specific submission as the final submission
// @route   PATCH /api/tasks/:id/submissions/:subId/final
// @access  Private (assigned tasker only, active tasks only)
exports.markSubmissionFinal = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot mark submissions as final'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';

    if (activeMode.toLowerCase() !== 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'You must switch to Tasker mode to mark a submission as final.'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.tasker || task.tasker.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned tasker can mark a submission as final'
      });
    }

    const blockedStatuses = ['COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED'];
    if (blockedStatuses.includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change final submission when task status is: ${task.status}`
      });
    }

    const subId = req.params.subId;
    let targetSubmission = null;

    // Clear isFinal on all; set only on target
    task.submissions.forEach((s) => {
      if (s._id.toString() === subId) {
        s.isFinal = true;
        targetSubmission = s;
      } else {
        s.isFinal = false;
      }
    });

    if (!targetSubmission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Sync root-level AI verification to the newly chosen final submission
    task.aiProofVerification = targetSubmission.aiProofVerification;

    await task.save();

    const savedTask = await Task.findById(task._id)
      .populate('requester', 'name email profileImage bio createdAt')
      .populate('tasker', 'name email profileImage bio createdAt');

    res.json({
      success: true,
      message: 'Submission marked as final',
      task: savedTask
    });
  } catch (error) {
    console.error('Mark Submission Final Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve submission & release escrow reward

// @route   POST /api/tasks/:id/approve
// @access  Private
exports.approveTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot approve tasks as requester. Admin dispute rulings should be performed in the Admin Portal.'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() === 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'Taskers are not authorized to approve tasks. Please switch to Requester mode.'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can approve task submission'
      });
    }

    if (task.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Task cannot be approved from status: ${task.status}`
      });
    }

    task.status = 'COMPLETED';
    task.completedAt = new Date();

    // Release Escrow to Tasker
    const requester = await User.findById(task.requester);
    const tasker = await User.findById(task.tasker);

    if (task.escrowStatus === 'HELD' && requester && tasker) {
      requester.escrowBalance = Math.max(0, (requester.escrowBalance || 0) - task.rewardAmount);
      tasker.walletBalance = (tasker.walletBalance || 0) + task.rewardAmount;
      task.escrowStatus = 'RELEASED';

      await requester.save();
      await tasker.save();

      // Record transaction for requester
      await Transaction.create({
        user: requester._id,
        task: task._id,
        type: 'ESCROW_RELEASE',
        amount: -task.rewardAmount,
        balanceAfter: requester.walletBalance,
        description: `Escrow released to tasker for "${task.title}"`,
        status: 'COMPLETED'
      });

      // Record transaction for tasker
      await Transaction.create({
        user: tasker._id,
        task: task._id,
        type: 'ESCROW_RELEASE',
        amount: task.rewardAmount,
        balanceAfter: tasker.walletBalance,
        description: `Task reward earned for completing "${task.title}"`,
        status: 'COMPLETED'
      });
    }

    await task.save();

    // Dispatch notification to tasker
    if (tasker) {
      await sendNotification({
        user: tasker._id,
        actor: req.user._id,
        task: task._id,
        type: 'TASK_APPROVED',
        title: 'Task Approved & Reward Credited!',
        message: `Your proof for "${task.title.substring(0, 30)}..." was approved! ₹${task.rewardAmount.toLocaleString('en-IN')} has been credited to your wallet.`,
        link: `/tasks/${task._id}`
      });
    }

    res.json({
      success: true,
      message: 'Task approved and reward released to tasker',
      task
    });
  } catch (error) {
    console.error('Approve Task Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dispute submission
// @route   POST /api/tasks/:id/dispute
// @access  Private
exports.disputeTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot dispute tasks as requester'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() === 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'Taskers are not authorized to dispute task submissions. Please switch to Requester mode.'
      });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for disputing this submission'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can dispute task submission'
      });
    }

    if (task.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Task cannot be disputed from status: ${task.status}`
      });
    }

    task.status = 'DISPUTED';
    task.dispute = {
      disputedAt: new Date(),
      reason
    };
    await task.save();

    // Dispatch notification to tasker
    if (task.tasker) {
      await sendNotification({
        user: task.tasker,
        actor: req.user._id,
        task: task._id,
        type: 'TASK_DISPUTED',
        title: 'Submission Disputed',
        message: `Requester has disputed your submission for "${task.title.substring(0, 30)}...". Reason: "${reason.substring(0, 50)}..."`,
        link: `/tasks/${task._id}`
      });
    }

    res.json({
      success: true,
      message: 'Submission marked DISPUTED for admin review',
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel task & refund escrow
// @route   POST /api/tasks/:id/cancel
// @access  Private
exports.cancelTask = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot cancel tasks as requester'
      });
    }

    const activeMode = req.headers['x-active-mode'] || 'requester';
    if (activeMode.toLowerCase() === 'tasker') {
      return res.status(403).json({
        success: false,
        message: 'Taskers are not authorized to cancel tasks. Please switch to Requester mode.'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this task'
      });
    }

    if (task.status !== 'OPEN' && task.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel task in status: ${task.status}`
      });
    }

    task.status = 'CANCELLED';
    task.cancelledAt = new Date();

    // Refund escrow if held
    const requester = await User.findById(task.requester);
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
        description: `Escrow refunded for cancelled task "${task.title}"`,
        status: 'COMPLETED'
      });
    }

    await task.save();

    // Dispatch notification to tasker if task was accepted
    if (task.tasker) {
      await sendNotification({
        user: task.tasker,
        actor: req.user._id,
        task: task._id,
        type: 'TASK_CANCELLED',
        title: 'Task Cancelled',
        message: `The task "${task.title.substring(0, 30)}..." was cancelled by the requester.`,
        link: `/tasks/${task._id}`
      });
    }

    res.json({
      success: true,
      message: 'Task cancelled successfully and escrow refunded',
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

