const User = require('../Models/User');

const validateSignup = (req, res, next) => {
    const { name, email, password, role, adminEmail } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password validation
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Role validation
    if (!['admin', 'employee', 'manager'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Admin email validation for employee signup
    if (role === 'employee' && !adminEmail) {
        return res.status(400).json({ message: 'Admin email is required for employee signup' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Role validation
    if (!['admin', 'employee', 'manager'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin
}; 