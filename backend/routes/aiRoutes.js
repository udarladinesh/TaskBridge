const express = require('express');
const router = express.Router();
const { scanTask, analyzeTaskProof } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/scan-task', scanTask);
router.post('/verify-proof/:taskId', analyzeTaskProof);

module.exports = router;
