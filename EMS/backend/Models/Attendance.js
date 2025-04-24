const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave', ''],
        required: true
    },
    timeIn: {
        type: String,
        default: '09:00'
    },
    timeOut: {
        type: String,
        default: '18:00'
    },
    notes: {
        type: String,
        default: ''
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
