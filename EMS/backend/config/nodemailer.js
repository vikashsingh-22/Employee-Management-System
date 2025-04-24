const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'employeemgmt.system@gmail.com',
        pass: 'qujb txtv uqrw kiyu'
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        console.log(`Attempting to send email to: ${to}`)
        console.log(`Subject: ${subject}`)
        
        const info = await transporter.sendMail({
            from: '"Employee Management System" <employeemgmt.system@gmail.com>',
            to,
            subject,
            html
        });
        
        console.log('Email sent successfully:');
        console.log('- Message ID:', info.messageId);
        console.log('- Response:', info.response);
        console.log('- Accepted recipients:', info.accepted);
        console.log('- Rejected recipients:', info.rejected);
        
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail };