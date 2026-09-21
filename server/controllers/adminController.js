const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const Feedback = require('../models/Feedback');

// @desc    Get Admin Dashboard Stats & Metrics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments({
      status: { $ne: 'Cancelled' }
    });
    const totalAttendance = await Attendance.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Category breakdown
    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalRegistered: { $sum: '$registeredCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly registrations distribution
    const monthlyRegistrations = await Registration.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top participated events
    const topEvents = await Event.find()
      .select('title category registeredCount capacity status date')
      .sort({ registeredCount: -1 })
      .limit(6);

    // Recent registrations
    const recentRegistrations = await Registration.find()
      .populate('student', 'name email course')
      .populate('event', 'title date')
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalOrganizers,
        totalEvents,
        totalRegistrations,
        totalAttendance,
        totalCertificates,
        attendanceRate:
          totalRegistrations > 0
            ? Math.round((totalAttendance / totalRegistrations) * 100)
            : 0
      },
      categoryStats,
      monthlyRegistrations,
      topEvents,
      recentRegistrations
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving admin statistics'
    });
  }
};

// @desc    Get all users with search and role filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (role && role !== 'All') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users'
    });
  }
};

// @desc    Update user role or profile by Admin
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUserByAdmin = async (req, res) => {
  try {
    const { role, name, phone, course, semester, enrollmentNumber } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (role) user.role = role;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (course) user.course = course;
    if (semester) user.semester = semester;
    if (enrollmentNumber !== undefined) user.enrollmentNumber = enrollmentNumber;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully by administrator',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin' && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Get all registrations system-wide
// @route   GET /api/admin/registrations
// @access  Private (Admin)
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('student', 'name email phone enrollmentNumber course semester')
      .populate('event', 'title date venue category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving registrations'
    });
  }
};

// @desc    Get all attendance system-wide
// @route   GET /api/admin/attendance
// @access  Private (Admin)
const getAllAttendance = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate('student', 'name email enrollmentNumber course semester')
      .populate('event', 'title date venue category')
      .populate('markedBy', 'name')
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      count: attendances.length,
      attendances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving attendance records'
    });
  }
};

// @desc    Get all certificates system-wide
// @route   GET /api/admin/certificates
// @access  Private (Admin)
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('student', 'name email enrollmentNumber course')
      .populate('event', 'title date venue category')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving certificates'
    });
  }
};

// @desc    Get all feedback system-wide
// @route   GET /api/admin/feedbacks
// @access  Private (Admin)
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('student', 'name email course')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving feedbacks'
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAllRegistrations,
  getAllAttendance,
  getAllCertificates,
  getAllFeedbacks
};
