const express = require('express');
const bcrypt = require('bcryptjs');
const Otp = require('../Models/Otp');
const router = express.Router();
const { auth, isManager } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');
const authController = require('../Controllers/authController');
const User = require('../Models/User');
const bcryptjs = require('bcryptjs');
const Task = require('../Models/Task');
const LeaveRequest = require('../Models/LeaveRequest');
const { createUserWithUniqueId } = require('../utils/idGenerator');

// Import Cloudinary
const cloudinary = require('../config/cloudinary');

// Public routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);

// Import sendEmail
const { sendEmail } = require('../config/nodemailer');

// Manager routes
router.post('/add-employee', auth, isManager, async (req, res) => {
    console.log('Add employee request received:', req.body);
    try {
        const { name, email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate random password
        const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
        
        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        console.log('Generated password:', password);

        // Create employee data object
        const employeeData = {
            name,
            email,
            password: hashedPassword,
            role: 'employee',
            adminRef: req.user._id
        };

        // Create new employee with unique ID and retry logic
        const employee = await createUserWithUniqueId(employeeData);

        // Send email to employee
        console.log('Sending welcome email to:', email);
        const emailTemplate = `
            <h2>Welcome to Employee Management System</h2>
            <p>Hello ${name},</p>
            <p>Your account has been created by manager ${req.user.name}.</p>
            <p>Here are your login credentials:</p>
            <p>Email: ${email}</p>
            <p>Password: ${password}</p>
            <p>Please login and change your password immediately.</p>
            <p>Login here: <a href="http://localhost:5173/login">Employee Management System</a></p>
        `;

        await sendEmail(
            email,
            'Your Employee Account Has Been Created',
            emailTemplate
        );
        console.log('Welcome email sent successfully');

        res.status(201).json({
            message: 'Employee added successfully',
            employee: {
                id: employee._id,
                name: employee.name,
                email: employee.email,
                employeeId: employee.employeeId,
                position: employee.position,
                department: employee.department
            },
            tempPassword: password // In production, this should be sent via email only
        });
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).json({ message: 'Error adding employee', error: error.message });
    }
});

// Get all employees (manager only)
router.get('/employees', auth, isManager, async (req, res) => {
    try {
        // Only fetch employees assigned to this manager
        const employees = await User.find({ 
            role: 'employee',
            adminRef: req.user._id  // Filter by manager's ID
        })
            .select('name email position department status leavesLeft salary employeeId')
            .sort({ name: 1 });
            
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Error fetching employees' });
    }
});

// Get dashboard stats (manager only)
router.get('/stats', auth, isManager, async (req, res) => {
    try {
        // Only count employees assigned to this manager
        const totalEmployees = await User.countDocuments({ 
            role: 'employee',
            adminRef: req.user._id  // Filter by manager's ID
        });
        
        // Only count tasks assigned to employees under this manager
        const employeeIds = await User.find({ 
            role: 'employee',
            adminRef: req.user._id
        }).select('_id');
        
        const employeeIdArray = employeeIds.map(emp => emp._id);
        
        const activeTasks = await Task.countDocuments({ 
            assignedTo: { $in: employeeIdArray },
            status: { $ne: 'completed' } 
        });
        
        // Only count leave requests from employees under this manager
        const pendingLeaves = await LeaveRequest.countDocuments({ 
            employee: { $in: employeeIdArray },
            status: 'pending' 
        });

        res.json({
            totalEmployees,
            activeTasks,
            pendingLeaves
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword, role } = req.body;

        console.log('Reset password attempt:', {
            email,
            role
        });

        // Find user with email and role
        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email and role' });
        }

        // Hash new password using bcryptjs
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        console.log('Password reset:', {
            email,
            role,
            newHash: hashedPassword
        });

        // Update password directly to avoid pre-save middleware
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Update employee route (Manager)
router.put('/employees/:id', auth, isManager, async (req, res) => {
    try {
        const updates = req.body;
        // Ensure required fields are present (department is now optional)
        if (!updates.name || !updates.email || !updates.position) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['name', 'email', 'position']
            });
        }

        // Convert leavesLeft to number if it exists
        if (updates.leavesLeft) {
            updates.leavesLeft = Number(updates.leavesLeft);
        }

        // Prepare update object, only set department if present
        const updateObj = {
            name: updates.name,
            email: updates.email,
            position: updates.position,
            status: updates.status,
            leavesLeft: updates.leavesLeft,
            salary: updates.salary
        };
        if (typeof updates.department !== 'undefined') {
            updateObj.department = updates.department;
        }

        const employee = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateObj },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ 
            message: 'Error updating employee', 
            error: error.message 
        });
    }
});

// Get current user data
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('name email role position department status leavesLeft salary profilePic phone address joiningDate employeeId');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Delete employee route
router.delete('/employees/:id', auth, isManager, async (req, res) => {
    try {
        const employee = await User.findByIdAndDelete(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({
            success: true,
            message: 'Employee deleted successfully',
            data: employee
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ 
            message: 'Error deleting employee', 
            error: error.message 
        });
    }
});

// Employee self-update route (cannot update email)
router.put('/me', auth, async (req, res) => {
    try {
        const updates = req.body;
        // Only allow updating allowed fields
        const allowedFields = ['name', 'position', 'department', 'status', 'leavesLeft', 'salary', 'profilePic', 'phone', 'address', 'joiningDate'];
        const updateObj = {};
        allowedFields.forEach(field => {
            if (typeof updates[field] !== 'undefined') {
                updateObj[field] = updates[field];
            }
        });

        // Prevent email update
        if (typeof updates.email !== 'undefined') {
            return res.status(400).json({ message: 'Email cannot be updated.' });
        }

        // Convert leavesLeft to number if it exists
        if (updateObj.leavesLeft) {
            updateObj.leavesLeft = Number(updateObj.leavesLeft);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateObj },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
});

// Upload profile photo route
router.post('/upload-profile-photo', auth, async (req, res) => {
    try {
        const { imageUrl, publicId } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        // Get the current user to check if they have an existing profile pic
        const currentUser = await User.findById(req.user._id);
        const previousPublicId = currentUser.profilePicId;

        // Update user's profile picture in the database
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 
                $set: { 
                    profilePic: imageUrl,
                    profilePicId: publicId // Store the public ID for future deletion
                } 
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the previous image if it exists
        if (previousPublicId) {
            try {
                await cloudinary.uploader.destroy(previousPublicId);
                console.log(`Previous profile image deleted: ${previousPublicId}`);
            } catch (deleteError) {
                console.error('Error deleting previous profile image:', deleteError);
                // We don't want to fail the whole request if deletion fails
            }
        }

        res.json({
            success: true,
            message: 'Profile photo updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error updating profile photo:', error);
        res.status(500).json({ 
            message: 'Error updating profile photo', 
            error: error.message 
        });
    }
});

module.exports = router; 