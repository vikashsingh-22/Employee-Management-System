const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { createUserWithUniqueId } = require('../utils/idGenerator');

const authController = {
    // Signup controller
    signup: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Hash password
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);

            // Create user data object
            const userData = {
                name,
                email,
                password: hashedPassword,
                role
            };

            // Create new user with unique ID and retry logic
            const user = await createUserWithUniqueId(userData);

            // If employee, use the admin reference from validation
            if (role === 'employee') {
                user.adminRef = req.adminRef;
            }

            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User created successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    employeeId: user.employeeId
                }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    },

    // Login controller
    login: async (req, res) => {
        try {
            const { email, password, role } = req.body;

            console.log('Login request received:', {
                email,
                role,
                passwordLength: password.length
            });

            // Find user by email and role
            const user = await User.findOne({ email, role });
            
            if (!user) {
                console.log('User not found with:', { email, role });
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            console.log('User found:', {
                id: user._id,
                email: user.email,
                role: user.role,
                storedHashLength: user.password.length
            });

            // Verify password
            try {
                const isPasswordValid = await bcryptjs.compare(password, user.password);
                console.log('Password comparison:', {
                    result: isPasswordValid,
                    inputPassword: password,
                    storedHash: user.password
                });

                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            } catch (compareError) {
                console.error('Error during password comparison:', compareError);
                return res.status(500).json({ message: 'Error verifying password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    employeeId: user.employeeId,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                    position: user.position,
                    department: user.department,
                    status: user.status,
                    leavesLeft: user.leavesLeft,
                    salary: user.salary,
                    phone: user.phone || '',
                    address: user.address || '',
                    joiningDate: user.joiningDate || ''
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    },

    // Get current user profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user._id).select('-password');
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    }
};

module.exports = authController; 