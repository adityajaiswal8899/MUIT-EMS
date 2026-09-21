const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with filters (search, category, status, date)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, category, status, date, limit = 50, page = 1 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      query.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email role')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: events.length,
      total,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving events'
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name email phone'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving event details'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer, Admin)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      date,
      startTime,
      endTime,
      venue,
      capacity,
      registrationDeadline,
      status
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !date ||
      !startTime ||
      !endTime ||
      !venue ||
      !capacity ||
      !registrationDeadline
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event details'
      });
    }

    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      image:
        image ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      capacity: Number(capacity),
      registeredCount: 0,
      registrationDeadline,
      organizer: req.user._id,
      organizerName: req.user.name,
      status: status || 'Registration Open'
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating event'
    });
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Private (Organizer, Admin)
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership if not admin
    if (
      req.user.role !== 'admin' &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer, Admin)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership if not admin
    if (
      req.user.role !== 'admin' &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Also clean up registrations for this event
    await Registration.deleteMany({ event: req.params.id });

    res.json({
      success: true,
      message: 'Event and associated registrations deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
};

// @desc    Get events managed by current organizer
// @route   GET /api/events/organizer/my
// @access  Private (Organizer, Admin)
const getOrganizerEvents = async (req, res) => {
  try {
    const query =
      req.user.role === 'admin' ? {} : { organizer: req.user._id };

    const events = await Event.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving organizer events'
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
};
