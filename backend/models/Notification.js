const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    type: {
      type: String,
      required: true,
      enum: [
        'TASK_ACCEPTED',
        'TASK_STARTED',
        'TASK_SUBMITTED',
        'TASK_APPROVED',
        'TASK_DISPUTED',
        'TASK_CANCELLED',
        'NEW_MESSAGE',
        'PAYMENT_RECEIVED',
        'DISPUTE_RESOLVED',
        'SYSTEM_ALERT'
      ]
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
