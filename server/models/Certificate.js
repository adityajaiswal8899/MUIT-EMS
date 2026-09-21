const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    certificateUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Issued', 'Revoked'],
      default: 'Issued'
    }
  },
  {
    timestamps: true
  }
);

// One certificate per student per event
certificateSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
