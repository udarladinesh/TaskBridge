const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserActive,
  getDisputedTasks,
  resolveDispute
} = require('../controllers/adminController');
const { getReports } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/disputes', getDisputedTasks);
router.put('/disputes/:id/resolve', resolveDispute);
router.get('/reports', getReports);

module.exports = router;

