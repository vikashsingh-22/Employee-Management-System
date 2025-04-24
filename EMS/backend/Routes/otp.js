const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const Otp = require('../Models/Otp');
const { sendEmail } = require('../config/nodemailer');

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
router.post('/send-otp', async (req, res) => {
    console.log('Send OTP request received:', req.body);
    try {
        const { email, type } = req.body;

        // Validate email and type
        if (!email || !type || !['signup', 'forgot'].includes(type)) {
            return res.status(400).json({ message: 'Invalid request parameters' });
        }

        // Check if user exists based on type
        const userExists = await User.findOne({ email });
        if (type === 'signup' && userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        if (type === 'forgot' && !userExists) {
            return res.status(404).json({ message: 'Email not registered' });
        }

        // Check cooldown period (60 seconds)
        const existingOTP = await Otp.findOne({ email });
        if (existingOTP) {
            const timeDiff = Date.now() - existingOTP.lastSentAt.getTime();
            if (timeDiff < 60000) { // 60 seconds
                const remainingTime = Math.ceil((60000 - timeDiff) / 1000);
                return res.status(429).json({
                    message: `Please wait ${remainingTime} seconds before requesting a new OTP`
                });
            }
            // Delete existing OTP
            await Otp.deleteOne({ email });
        }

        // Generate and hash new OTP
        const plainOTP = generateOTP();
        console.log('Generated OTP:', plainOTP);
        const hashedOTP = await bcrypt.hash(plainOTP, 10);
        console.log('Hashed OTP:', hashedOTP);

        // Save OTP to database
        console.log('Attempting to save OTP...');
        const otpDoc = await Otp.create({
            email,
            otp: hashedOTP,
            type,
            lastSentAt: new Date()
        });
        
        console.log('Created OTP document:', {
            id: otpDoc._id,
            email: otpDoc.email,
            type: otpDoc.type,
            hashedOTP: otpDoc.otp,
            lastSentAt: otpDoc.lastSentAt
        });

        console.log('OTP saved successfully:', otpDoc._id);

        // Send OTP via email
        console.log('Sending email...');
        const emailTemplate = `
            <h2>Your OTP for ${type === 'signup' ? 'Sign Up' : 'Password Reset'}</h2>
            <p>Your One Time Password is: <strong>${plainOTP}</strong></p>
            <p>This OTP will expire in 2 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        await sendEmail(
            email,
            `OTP for ${type === 'signup' ? 'Sign Up' : 'Password Reset'}`,
            emailTemplate
        );

        console.log('Email sent successfully');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    console.log('Verify OTP request received:', req.body);
    try {
        const { email, otp } = req.body;

        // Find OTP document
        const otpDoc = await Otp.findOne({ email });
        console.log('Found OTP document:', otpDoc ? {
            id: otpDoc._id,
            email: otpDoc.email,
            type: otpDoc.type,
            hashedOTP: otpDoc.otp,
            lastSentAt: otpDoc.lastSentAt
        } : 'No OTP found');
        
        if (!otpDoc) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, otpDoc.otp);
        console.log('OTP verification result:', {
            isValid,
            providedOTP: otp,
            hashedOTP: otpDoc.otp
        });
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Delete OTP after successful verification
        await Otp.deleteOne({ email });

        res.json({ 
            message: 'OTP verified successfully',
            type: otpDoc.type
        });
    } catch (error) {
        console.error('Error in verify-otp:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// Cancel OTP
router.post('/cancel-otp', async (req, res) => {
    try {
        const { email } = req.body;
        await Otp.deleteOne({ email });
        res.json({ message: 'OTP cancelled successfully' });
    } catch (error) {
        console.error('Error in cancel-otp:', error);
        res.status(500).json({ message: 'Error cancelling OTP' });
    }
});

module.exports = router; 