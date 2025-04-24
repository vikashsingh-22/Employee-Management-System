const express = require('express');
const router = express.Router();
const { auth, isAdmin, isManager } = require('../middleware/auth');
const LeaveRequest = require('../Models/LeaveRequest');
const User = require('../Models/User');

// Get all leave requests (for managers)
router.get('/', auth, isManager, async (req, res) => {
    try {
        const leaves = await LeaveRequest.find()
            .populate('employee', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests' });
    }
});

// Get leave requests for logged-in employee
router.get('/my-leaves', auth, async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ employee: req.user._id })
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests' });
    }
});

// Create leave request
router.post('/', auth, async (req, res) => {
    try {
        const leaveRequest = new LeaveRequest({
            ...req.body,
            employee: req.user._id,
            status: 'pending'
        });
        await leaveRequest.save();
        
        const populatedLeave = await LeaveRequest.findById(leaveRequest._id)
            .populate('reviewedBy', 'name');
            
        res.status(201).json(populatedLeave);
    } catch (error) {
        res.status(500).json({ message: 'Error creating leave request' });
    }
});

// Update leave request status (for managers)
router.put('/:id', auth, isManager, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Find the leave request and populate employee details
        const leave = await LeaveRequest.findById(req.params.id)
            .populate('employee', 'name email leavesLeft');
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Calculate leave days
        const startDate = new Date(leave.fromDate);
        const endDate = new Date(leave.toDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        // Update leave request status
        leave.status = status;
        leave.reviewedBy = req.user._id;
        leave.reviewedAt = new Date();
        await leave.save();

        // If approved, update employee's leave balance
        if (status === 'approved') {
            const employee = await User.findById(leave.employee._id);
            if (employee) {
                employee.leavesLeft = Math.max(0, (employee.leavesLeft || 20) - days);
                await employee.save();
            }
        }

        // Return the updated leave request with populated details
        const updatedLeave = await LeaveRequest.findById(leave._id)
            .populate('employee', 'name email')
            .populate('reviewedBy', 'name');

        res.json(updatedLeave);
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({ message: 'Error updating leave request' });
    }
});

// Get leave statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await LeaveRequest.aggregate([
            { $match: { employee: req.user._id } },
            { $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                approved: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
                    }
                },
                pending: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                    }
                },
                rejected: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0]
                    }
                }
            }}
        ]);

        res.json(stats[0] || { totalRequests: 0, approved: 0, pending: 0, rejected: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave statistics' });
    }
});

module.exports = router; 