const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const { isManager } = require('../middleware/isManager');

// Mark attendance (Manager only)
router.post('/mark', auth, isManager, async (req, res) => {
  try {
    const { employeeId, date, status, timeIn, timeOut, notes } = req.body;

    // Validate required fields
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create or update attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: new Date(date) },
      { status, timeIn, timeOut, notes },
      { new: true, upsert: true }
    );

    res.json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance' });
  }
});

// Get attendance records (Manager only)
router.get('/records', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const query = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.find(query)
      .populate('employeeId', 'name email')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Get employee's own attendance
router.get('/my-attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { employeeId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

module.exports = router;
