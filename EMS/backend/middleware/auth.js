const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const isManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Manager access required' });
    }
    next();
};

const isEmployee = (req, res, next) => {
    if (req.user.role !== 'employee') {
        return res.status(403).json({ message: 'Employee access required' });
    }
    next();
};

module.exports = {
    auth,
    isManager,
    isEmployee
}; 