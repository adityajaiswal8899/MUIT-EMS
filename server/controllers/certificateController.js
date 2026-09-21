const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Generate certificate for an attendee
// @route   POST /api/certificates
// @access  Private (Organizer, Admin)
const generateCertificate = async (req, res) => {
  try {
    const { studentId, eventId } = req.body;

    if (!studentId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Event ID are required'
      });
    }

    // Verify attendance
    const attendance = await Attendance.findOne({
      student: studentId,
      event: eventId
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue certificate: Student has not attended this event'
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      student: studentId,
      event: eventId
    });

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already issued for this student',
        certificate
      });
    }

    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const certificateId = `MUIT-CERT-${new Date().getFullYear()}-${randomSuffix}`;

    certificate = await Certificate.create({
      student: studentId,
      event: eventId,
      certificateId,
      issueDate: new Date(),
      status: 'Issued'
    });

    await certificate.populate('student', 'name email enrollmentNumber course');
    await certificate.populate('event', 'title date venue organizerName');

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error generating certificate'
    });
  }
};

// @desc    Batch generate certificates for all present attendees of an event
// @route   POST /api/certificates/batch/:eventId
// @access  Private (Organizer, Admin)
const batchGenerateCertificates = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendances = await Attendance.find({ event: eventId });

    if (!attendances.length) {
      return res.status(400).json({
        success: false,
        message: 'No attended participants found for this event to issue certificates.'
      });
    }

    let issuedCount = 0;
    for (const att of attendances) {
      const exists = await Certificate.findOne({
        student: att.student,
        event: eventId
      });

      if (!exists) {
        const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
        const certificateId = `MUIT-CERT-${new Date().getFullYear()}-${randomSuffix}`;

        await Certificate.create({
          student: att.student,
          event: eventId,
          certificateId,
          issueDate: new Date(),
          status: 'Issued'
        });
        issuedCount++;
      }
    }

    res.json({
      success: true,
      message: `Batch certificate generation complete. ${issuedCount} new certificates issued.`,
      issuedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during batch certificate generation'
    });
  }
};

// @desc    Get current student's certificates
// @route   GET /api/certificates/my
// @access  Private (Student)
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('event', 'title date venue category organizerName')
      .populate('student', 'name email enrollmentNumber course semester')
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

// @desc    Get certificate by public ID (for verification)
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('student', 'name email enrollmentNumber course semester')
      .populate('event', 'title date venue category organizerName');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid certificate ID'
      });
    }

    res.json({
      success: true,
      verified: true,
      certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error verifying certificate'
    });
  }
};

module.exports = {
  generateCertificate,
  batchGenerateCertificates,
  getMyCertificates,
  verifyCertificate
};
