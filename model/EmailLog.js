// models/EmailLog.js
const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    recipients: {
        type: [String], // Changed from ObjectId to String array
        required: true,
        validate: {
            validator: function(emails) {
                // Basic email validation for each recipient
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emails.every(email => emailRegex.test(email));
            },
            message: 'Invalid email address format'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    messageId: String,
    error: String,
    attachments: [{
        filename: String,
        path: String
    }],
    invalidRecipients: [{
        email: String,
        reason: String
    }]
,    
    createdAt: {
        type: Date,
        default: Date.now
    },
    sentAt: Date
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;