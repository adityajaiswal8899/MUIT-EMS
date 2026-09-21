const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getEventAttendance,
  getMyAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/scan', protect, authorize('organizer', 'admin'), markAttendance);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventAttendance);
router.get('/my', protect, getMyAttendance);

module.exports = router;
