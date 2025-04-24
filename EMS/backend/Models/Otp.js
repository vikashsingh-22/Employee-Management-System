const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['signup', 'forgot'],
        required: true
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for email to ensure fast lookups
otpSchema.index({ email: 1 });

// Create TTL index on createdAt field
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });

const Otp = mongoose.model('Otp', otpSchema, 'otps');

// Ensure indexes are created
Otp.createIndexes().then(() => {
    console.log('OTP indexes created successfully');
    // Log collection info
    console.log('OTP collection name:', Otp.collection.name);
    console.log('OTP collection namespace:', Otp.collection.namespace);
}).catch(err => {
    console.error('Error creating OTP indexes:', err);
});

module.exports = Otp;