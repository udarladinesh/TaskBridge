const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendNotification } = require('../utils/notificationHelper');

// @desc    Get current user wallet balance and transaction history
// @route   GET /api/wallet
// @access  Private
exports.getWalletDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const transactions = await Transaction.find({ user: req.user._id })
      .populate('task', 'title category status rewardAmount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      walletBalance: user.walletBalance || 0,
      escrowBalance: user.escrowBalance || 0,
      totalBalance: (user.walletBalance || 0) + (user.escrowBalance || 0),
      currency: 'INR',
      transactions
    });
  } catch (error) {
    console.error('Get Wallet Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add mock funds (Top-up) to wallet
// @route   POST /api/wallet/deposit
// @access  Private
exports.depositFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid deposit amount greater than 0'
      });
    }

    const user = await User.findById(req.user._id);
    user.walletBalance = (user.walletBalance || 0) + numAmount;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: 'DEPOSIT',
      amount: numAmount,
      balanceAfter: user.walletBalance,
      description: `Test wallet deposit of ₹${numAmount.toLocaleString('en-IN')}`,
      status: 'COMPLETED'
    });

    await sendNotification({
      user: user._id,
      type: 'PAYMENT_RECEIVED',
      title: 'Wallet Funded',
      message: `₹${numAmount.toLocaleString('en-IN')} has been added to your available wallet balance.`,
      link: '/wallet'
    });

    res.json({
      success: true,
      message: `Successfully deposited ₹${numAmount.toLocaleString('en-IN')}`,
      walletBalance: user.walletBalance,
      escrowBalance: user.escrowBalance,
      transaction
    });
  } catch (error) {
    console.error('Deposit Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mock withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount greater than 0'
      });
    }

    const user = await User.findById(req.user._id);
    if ((user.walletBalance || 0) < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have ₹${user.walletBalance || 0} available.`
      });
    }

    user.walletBalance -= numAmount;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: 'WITHDRAWAL',
      amount: numAmount,
      balanceAfter: user.walletBalance,
      description: `Withdrawal transfer to bank/UPI (${bankDetails || 'Default Payout Account'})`,
      status: 'COMPLETED'
    });

    await sendNotification({
      user: user._id,
      type: 'PAYMENT_RECEIVED',
      title: 'Withdrawal Processed',
      message: `₹${numAmount.toLocaleString('en-IN')} has been withdrawn to your payout account.`,
      link: '/wallet'
    });

    res.json({
      success: true,
      message: `Successfully processed withdrawal of ₹${numAmount.toLocaleString('en-IN')}`,
      walletBalance: user.walletBalance,
      escrowBalance: user.escrowBalance,
      transaction
    });
  } catch (error) {
    console.error('Withdraw Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
