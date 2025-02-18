// models/EmailLog.js
const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    }],
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    error: {
        type: String
    },
    sentAt: {
        type: Date
    }
}, { timestamps: true });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;