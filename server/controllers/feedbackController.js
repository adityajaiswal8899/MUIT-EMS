const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Submit feedback for an event
// @route   POST /api/feedback
// @access  Private (Student)
const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, rating (1-5), and feedback comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify student is registered or attended
    const registered = await Registration.findOne({
      student: req.user._id,
      event: eventId
    });

    if (!registered) {
      return res.status(400).json({
        success: false,
        message: 'You can only give feedback for events you registered for'
      });
    }

    // Check if feedback already submitted
    const existingFeedback = await Feedback.findOne({
      student: req.user._id,
      event: eventId
    });

    if (existingFeedback) {
      existingFeedback.rating = Number(rating);
      existingFeedback.comment = comment.trim();
      await existingFeedback.save();

      return res.json({
        success: true,
        message: 'Feedback updated successfully',
        feedback: existingFeedback
      });
    }

    const feedback = await Feedback.create({
      student: req.user._id,
      event: eventId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await feedback.populate('student', 'name course semester');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your review!',
      feedback
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error submitting feedback'
    });
  }
};

// @desc    Get feedback for a specific event with average rating
// @route   GET /api/feedback/event/:eventId
// @access  Public
const getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;

    const feedbacks = await Feedback.find({ event: eventId })
      .populate('student', 'name course semester profileImage')
      .sort({ createdAt: -1 });

    const totalRatings = feedbacks.length;
    const averageRating =
      totalRatings > 0
        ? (
            feedbacks.reduce((acc, curr) => acc + curr.rating, 0) /
            totalRatings
          ).toFixed(1)
        : '0.0';

    res.json({
      success: true,
      count: totalRatings,
      averageRating: parseFloat(averageRating),
      feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving event feedback'
    });
  }
};

// @desc    Get feedbacks submitted by current student
// @route   GET /api/feedback/my
// @access  Private (Student)
const getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user._id })
      .populate('event', 'title date venue category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your feedbacks'
    });
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getMyFeedbacks
};
