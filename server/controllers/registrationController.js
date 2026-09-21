const crypto = require('crypto');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Attendance = require('../models/Attendance');
const { generateQRCodeDataURL } = require('../utils/qrHelper');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Student)
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // 1. Check if event is cancelled or completed
    if (event.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This event has been cancelled and registrations are closed.'
      });
    }

    if (event.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This event has already taken place.'
      });
    }

    // 2. Check registration deadline
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    if (deadline < now) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline for this event has passed.'
      });
    }

    // 3. Check event capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event has reached maximum capacity. Registrations are full.'
      });
    }

    // 4. Check if student is already registered
    const existingRegistration = await Registration.findOne({
      student: req.user._id,
      event: eventId
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'Cancelled') {
        // Re-activate registration
        existingRegistration.status = 'Registered';
        await existingRegistration.save();

        event.registeredCount += 1;
        await event.save();

        return res.json({
          success: true,
          message: 'Your registration has been reactivated successfully!',
          registration: existingRegistration
        });
      }

      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.'
      });
    }

    // 5. Generate unique registration ID
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const registrationId = `MUIT-REG-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // 6. Generate QR code payload and image
    const qrPayload = {
      registrationId,
      studentId: req.user._id.toString(),
      studentName: req.user.name,
      eventId: event._id.toString(),
      eventTitle: event.title
    };

    const qrCodeDataUrl = await generateQRCodeDataURL(qrPayload);

    // 7. Save registration in MongoDB
    const registration = await Registration.create({
      student: req.user._id,
      event: eventId,
      registrationId,
      qrCode: qrCodeDataUrl,
      status: 'Registered'
    });

    // 8. Increment event registeredCount
    event.registeredCount += 1;
    await event.save();

    await registration.populate('event', 'title date venue startTime endTime image category');

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event! Your QR Pass is ready.',
      registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during event registration'
    });
  }
};

// @desc    Get all registrations of current student
// @route   GET /api/registrations/my
// @access  Private (Student)
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });

    // Also fetch attendance status for each registration
    const registrationIds = registrations.map((r) => r._id);
    const attendances = await Attendance.find({
      registration: { $in: registrationIds }
    });

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      attendanceMap.set(att.registration.toString(), att);
    });

    const enrichedRegistrations = registrations.map((reg) => {
      const att = attendanceMap.get(reg._id.toString());
      return {
        ...reg.toObject(),
        attendance: att
          ? {
              status: att.status,
              checkInTime: att.checkInTime
            }
          : null
      };
    });

    res.json({
      success: true,
      count: enrichedRegistrations.length,
      registrations: enrichedRegistrations
    });
  } catch (error) {
    console.error('Error fetching student registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your registrations'
    });
  }
};

// @desc    Get all registrations for a specific event
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer, Admin)
const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check organizer permissions
    if (
      req.user.role !== 'admin' &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this event'
      });
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate('student', 'name email phone enrollmentNumber course semester')
      .sort({ createdAt: -1 });

    // Include attendance status
    const regIds = registrations.map((r) => r._id);
    const attendances = await Attendance.find({
      registration: { $in: regIds }
    });

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      attendanceMap.set(att.registration.toString(), att);
    });

    const enriched = registrations.map((r) => {
      const att = attendanceMap.get(r._id.toString());
      return {
        ...r.toObject(),
        attended: !!att,
        checkInTime: att ? att.checkInTime : null
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      registrations: enriched
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving event registrations'
    });
  }
};

// @desc    Cancel an event registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student)
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found'
      });
    }

    if (
      req.user.role !== 'admin' &&
      registration.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      });
    }

    if (registration.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled'
      });
    }

    registration.status = 'Cancelled';
    await registration.save();

    // Decrement event registeredCount
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registeredCount: -1 }
    });

    res.json({
      success: true,
      message: 'Event registration cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error cancelling registration'
    });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration
};
