const nodemailer = require('nodemailer');
const EmailVerifier = require('./emailVerifier');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
            },
        });
    }

    async sendEmail(mailOptions) {
        return await this.transporter.sendMail(mailOptions);
    }

    prepareMailOptions(recipients, subject, message, attachments = []) {
        return {
            from: process.env.EMAIL_FROM,
            bcc: Array.isArray(recipients) ? recipients.join(', ') : recipients,
            subject: subject,
            text: message.replace(/<[^>]*>/g, ''),
            html: message,
            attachments: attachments
        };
    }
}

module.exports = EmailService;

module.exports = EmailService;
