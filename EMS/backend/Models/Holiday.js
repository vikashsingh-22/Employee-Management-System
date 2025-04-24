const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Prevent duplicate holidays on same date
holidaySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Holiday', holidaySchema);
