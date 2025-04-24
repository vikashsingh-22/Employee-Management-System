const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    position: {
        type: String,
        default: 'Not Set'
    },
    department: {
        type: String,
        default: 'Not Set'
    },
    role: {
        type: String,
        enum: ['employee', 'manager'],
        required: true
    },
    salary: {
        type: Number,
        default: 0
    },
    profilePic: {
        type: String,
        default: ''
    },
    profilePicId: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    joiningDate: {
        type: String,
        default: ''
    },
    leavesLeft: {
        type: Number,
        default: 20 // Default 20 leaves per year
    },
    status: {
        type: String,
        enum: ['active', 'terminated'],
        default: 'active'
    },
    adminRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
