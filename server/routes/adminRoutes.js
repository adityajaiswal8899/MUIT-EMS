const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAllRegistrations,
  getAllAttendance,
  getAllCertificates,
  getAllFeedbacks
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Admin only routes
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);
router.get('/registrations', getAllRegistrations);
router.get('/attendance', getAllAttendance);
router.get('/certificates', getAllCertificates);
router.get('/feedbacks', getAllFeedbacks);

module.exports = router;
