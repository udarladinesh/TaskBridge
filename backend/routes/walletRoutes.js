const express = require('express');
const router = express.Router();
const {
  getWalletDetails,
  depositFunds,
  withdrawFunds
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWalletDetails);
router.post('/deposit', depositFunds);
router.post('/withdraw', withdrawFunds);

module.exports = router;
