const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Technical',
        'Workshop',
        'Cultural',
        'Sports',
        'Seminar',
        'Competition',
        'Career & Placement',
        'Exhibition',
        'General'
      ],
      default: 'Technical'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    duration: {
      type: String,
      default: ''
    },
    venue: {
      type: String,
      required: [true, 'Venue is required']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required']
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerName: {
      type: String,
      default: 'MUIT Event Committee'
    },
    status: {
      type: String,
      enum: [
        'Upcoming',
        'Registration Open',
        'Registration Closed',
        'Ongoing',
        'Completed',
        'Cancelled'
      ],
      default: 'Registration Open'
    }
  },
  {
    timestamps: true
  }
);

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  const deadline = new Date(this.registrationDeadline);
  return (
    this.status === 'Registration Open' &&
    deadline > now &&
    this.registeredCount < this.capacity
  );
});

module.exports = mongoose.model('Event', eventSchema);
