const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed task description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a task category'],
      enum: [
        'verification',
        'photo_collection',
        'information_collection',
        'pickup',
        'local_assistance',
        'inspection',
        'other'
      ]
    },
    location: {
      country: {
        type: String,
        required: true,
        default: 'India'
      },
      state: {
        type: String,
        required: [true, 'Please provide a state']
      },
      city: {
        type: String,
        required: [true, 'Please provide a city']
      },
      locality: {
        type: String,
        required: [true, 'Please provide an area or locality']
      },
      additionalDetails: {
        type: String,
        default: ''
      }
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify a deadline date and time']
    },
    rewardAmount: {
      type: Number,
      required: [true, 'Please specify a reward amount'],
      min: [0, 'Reward amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    proofRequirement: {
      type: String,
      required: [true, 'Please specify proof requirement type'],
      enum: ['photo', 'video', 'text_description', 'document', 'multiple', 'none'],
      default: 'photo'
    },
    proofInstructions: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'ACCEPTED',
        'IN_PROGRESS',
        'SUBMITTED',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED',
        'DISPUTED'
      ],
      default: 'OPEN'
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tasker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    submission: {
      submittedAt: { type: Date },
      description: { type: String, default: '' },
      proofFiles: [{ type: String }]
    },
    dispute: {
      disputedAt: { type: Date },
      reason: { type: String, default: '' }
    },
    escrowStatus: {
      type: String,
      enum: ['PENDING', 'HELD', 'RELEASED', 'REFUNDED'],
      default: 'PENDING'
    },
    aiSafetyScore: {
      score: { type: Number, default: 95 },
      riskLevel: { type: String, enum: ['SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'], default: 'SAFE' },
      feedback: { type: String, default: 'Compliant with community guidelines' }
    },
    aiProofVerification: {
      verifiedAt: { type: Date },
      matchScore: { type: Number },
      confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
      recommendation: { type: String, enum: ['RECOMMEND_APPROVE', 'MANUAL_REVIEW', 'FLAG_CONCERNS'] },
      findings: [{ type: String }],
      summary: { type: String }
    },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Method to safely update task status if expired
taskSchema.methods.checkExpiration = async function () {
  if (this.status === 'OPEN' && new Date(this.deadline) < new Date()) {
    this.status = 'EXPIRED';
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Task', taskSchema);
