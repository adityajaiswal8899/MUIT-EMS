const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getEventFeedback,
  getMyFeedbacks
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

router.post('/', protect, submitFeedback);
router.get('/event/:eventId', getEventFeedback);
router.get('/my', protect, getMyFeedbacks);

module.exports = router;
