const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTaskMessages,
  sendTaskMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getTaskMessages);
router.post('/', upload.array('attachments', 3), sendTaskMessage);

module.exports = router;
