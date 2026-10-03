const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback comments'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// One feedback per student per event
feedbackSchema.index({ student: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema); 
