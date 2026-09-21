const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { parseQRData } = require('../utils/qrHelper');

// @desc    Mark attendance via QR code scan or manual Registration ID input
// @route   POST /api/attendance/scan
// @access  Private (Organizer, Admin)
const markAttendance = async (req, res) => {
  try {
    const { qrData, eventId } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scan: QR code data or Registration ID is required'
      });
    }

    // Parse payload (could be raw JSON or raw string)
    const parsed = parseQRData(qrData);
    const regIdToSearch = parsed ? parsed.registrationId : qrData.trim();

    if (!regIdToSearch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid / Unrecognized QR Code format'
      });
    }

    // Find the registration (case-insensitive search)
    const registration = await Registration.findOne({
      registrationId: { $regex: new RegExp(`^${regIdToSearch.trim()}$`, 'i') }
    })
      .populate('student', 'name email enrollmentNumber course semester')
      .populate('event', 'title date venue organizer organizerName');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: `Invalid QR Code: No registration record found for "${regIdToSearch}"`
      });
    }

    // Check if registration was cancelled
    if (registration.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Invalid Pass: This registration was cancelled by the student.`
      });
    }

    // Verify event matching IF a specific event is strictly selected (not empty or 'all')
    if (eventId && eventId !== 'all' && eventId !== '' && registration.event?._id?.toString() !== eventId.toString()) {
      return res.status(400).json({
        success: false,
        message: `This pass is registered for "${registration.event?.title}". To scan it, please select "${registration.event?.title}" or "Any Event / Auto-Detect" in the event dropdown.`,
        student: registration.student,
        event: registration.event
      });
    }

    // Verify organizer or admin role
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to mark attendance. Organizer or Admin role required.'
      });
    }

    // Prevent duplicate attendance
    const existingAttendance = await Attendance.findOne({
      registration: registration._id
    });

    if (existingAttendance) {
      const checkInFormatted = new Date(existingAttendance.checkInTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      return res.status(409).json({
        success: false,
        alreadyMarked: true,
        message: `Invalid / Already Used QR Code! Already checked in at ${checkInFormatted}`,
        attendance: existingAttendance,
        student: registration.student,
        event: registration.event
      });
    }

    // Mark attendance
    const attendance = await Attendance.create({
      student: registration.student._id,
      event: registration.event._id,
      registration: registration._id,
      checkInTime: new Date(),
      markedBy: req.user._id,
      status: 'Present'
    });

    // Update registration status to Attended
    registration.status = 'Attended';
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Attendance Marked Successfully',
      attendance,
      student: registration.student,
      event: registration.event
    });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error marking attendance'
    });
  }
};

// @desc    Get attendance list for a specific event
// @route   GET /api/attendance/event/:eventId
// @access  Private (Organizer, Admin)
const getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendances = await Attendance.find({ event: eventId })
      .populate('student', 'name email enrollmentNumber course semester phone')
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

// @desc    Get current student's attendance records
// @route   GET /api/attendance/my
// @access  Private (Student)
const getMyAttendance = async (req, res) => {
  try {
    const attendances = await Attendance.find({ student: req.user._id })
      .populate('event', 'title date venue category')
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      count: attendances.length,
      attendances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your attendance records'
    });
  }
};

module.exports = {
  markAttendance,
  getEventAttendance,
  getMyAttendance
};
