require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('--- Email Configuration Test ---');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'NOT SET');

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Connection Verification Failed:');
        console.error(error);
    } else {
        console.log('✅ Server is ready to take our messages');

        const mailOptions = {
            from: `"CabZee Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Email Connectivity Test',
            text: 'If you see this, email is working!'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Sending Failed:');
                console.error(error);
            } else {
                console.log('✅ Email sent successfully!');
                console.log('Message ID:', info.messageId);
            }
            process.exit();
        });
    }
});
