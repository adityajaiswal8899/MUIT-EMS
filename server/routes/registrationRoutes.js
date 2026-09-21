const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.get('/event/:id', protect, authorize('organizer', 'admin'), getEventRegistrations);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;
