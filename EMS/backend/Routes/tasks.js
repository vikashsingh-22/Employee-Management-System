const express = require('express');
const router = express.Router();
const { auth, isAdmin, isManager } = require('../middleware/auth');
const Task = require('../Models/Task');

// Get all tasks (for managers)
router.get('/', auth, isManager, async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email')
            .sort({ deadline: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

// Get employee's tasks
router.get('/my-tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('assignedBy', 'name email')
            .sort({ deadline: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});

// Create new task (admin/manager only)
router.post('/', auth, isManager, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            assignedBy: req.user._id,
            accepted: false,
            status: 'pending'
        });
        await task.save();
        
        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email');
            
        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
});

// Accept task (employee only)
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        task.accepted = true;
        await task.save();
        
        const updatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email');
            
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting task', error: error.message });
    }
});

// Update task status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is either the assigned employee or a manager
        const isAssignedEmployee = task.assignedTo.toString() === req.user._id.toString();
        const isManager = req.user.role === 'manager';

        if (!isAssignedEmployee && !isManager) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Only allow employees to update their own tasks to 'in-progress' or 'completed'
        const { status } = req.body;
        if (isAssignedEmployee && !isManager && !['in-progress', 'completed'].includes(status)) {
            return res.status(403).json({ message: 'Invalid status update' });
        }

        // If task is being marked as completed, ensure it was accepted first
        if (status === 'completed' && !task.accepted) {
            return res.status(400).json({ message: 'Task must be accepted before completion' });
        }

        task.status = status;
        await task.save();
        
        const updatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email');
        
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task status' });
    }
});

// Get task statistics for an employee
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await Task.aggregate([
            { $match: { assignedTo: req.user._id } },
            { $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: { 
                    $sum: { 
                        $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                    }
                },
                inProgressTasks: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
                    }
                }
            }}
        ]);

        res.json(stats[0] || { totalTasks: 0, completedTasks: 0, inProgressTasks: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task statistics' });
    }
});

module.exports = router; 