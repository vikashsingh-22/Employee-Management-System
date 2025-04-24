const express = require('express');
const router = express.Router();
const Attendance = require('../Models/Attendance');
const Holiday = require('../Models/Holiday');
const { auth, isManager } = require('../middleware/auth');

// Mark attendance for an employee
router.post('/mark', auth, isManager, async (req, res) => {
    try {
        const { employeeId, date, status, timeIn, timeOut, notes } = req.body;
        const attendanceDate = new Date(date);
        
        // Check if the employee has an approved leave for this date
        const LeaveRequest = require('../Models/LeaveRequest');
        const leaveRequest = await LeaveRequest.findOne({
            employee: employeeId,
            status: 'approved',
            fromDate: { $lte: attendanceDate },
            toDate: { $gte: attendanceDate }
        });
        
        let finalStatus = status;
        let finalNotes = notes || '';
        
        // If an approved leave exists for this date, override the status
        if (leaveRequest) {
            finalStatus = 'Leave';
            finalNotes = finalNotes ? `${finalNotes} (On Leave)` : 'On Leave';
        }
        
        const attendance = await Attendance.findOneAndUpdate(
            { employeeId, date: attendanceDate },
            {
                employeeId,
                date: attendanceDate,
                status: finalStatus,
                timeIn: finalStatus === 'Present' ? (timeIn || '09:00') : '',
                timeOut: finalStatus === 'Present' ? (timeOut || '18:00') : '',
                notes: finalNotes,
                markedBy: req.user.id
            },
            { upsert: true, new: true }
        );
        
        // If we overrode the status, let the frontend know
        if (leaveRequest && status !== 'Leave') {
            return res.status(200).json({
                attendance,
                message: 'Employee has an approved leave for this date. Status automatically set to Leave.'
            });
        }
        
        res.json(attendance);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get attendance records (with filters)
router.get('/records', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = {};
        let startDate, endDate;
        // If user is not a manager, only show their own records
        const employeeId = req.user.isManager ? req.query.employeeId : req.user.id;
        if (!req.user.isManager) {
            query.employeeId = employeeId;
        }

        // If month and year are provided, filter by that month
        if (month && year) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Fetch only real attendance records
        const records = await Attendance.find(query)
            .populate('employeeId', 'name email')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Manage holidays
router.post('/holiday', auth, isManager, async (req, res) => {
    try {
        const { name, date, description } = req.body;
        const holiday = new Holiday({
            name,
            date: new Date(date),
            description,
            createdBy: req.user.id
        });
        await holiday.save();
        res.json(holiday);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get holidays
router.get('/holidays', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const holidays = await Holiday.find(query).sort({ date: 1 });
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get monthly attendance summary
router.get('/summary/:employeeId', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const records = await Attendance.find({
            employeeId: req.params.employeeId,
            date: { $gte: startDate, $lte: endDate }
        });
        
        const summary = {
            present: records.filter(r => r.status === 'Present').length,
            absent: records.filter(r => r.status === 'Absent').length,
            total: records.length,
            attendance: (records.filter(r => r.status === 'Present').length / records.length) * 100
        };
        
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
