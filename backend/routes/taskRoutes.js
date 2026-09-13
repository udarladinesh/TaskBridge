const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  getMyPostedTasks,
  getMyAcceptedTasks,
  acceptTask,
  startTask,
  submitTask,
  approveTask,
  disputeTask,
  cancelTask
} = require('../controllers/taskController');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Base task routes
router.get('/', getTasks);
router.post('/', protect, createTask);

// My tasks dashboard views
router.get('/my-posted', protect, getMyPostedTasks);
router.get('/my-accepted', protect, getMyAcceptedTasks);

// Single task details
router.get('/:id', getTaskById);

// Task lifecycle actions
router.post('/:id/accept', protect, acceptTask);
router.post('/:id/start', protect, startTask);
router.post(
  '/:id/submit',
  protect,
  upload.array('proofFiles', 5),
  submitTask
);
router.post('/:id/approve', protect, approveTask);
router.post('/:id/dispute', protect, disputeTask);
router.post('/:id/cancel', protect, cancelTask);

// Task safety report
router.post('/:id/report', protect, createReport);

// Task chat messages
router.use('/:id/messages', require('./messageRoutes'));

module.exports = router;
