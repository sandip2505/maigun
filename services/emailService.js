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
        // const transporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //       user: process.env.EMAIL,
        //       pass: process.env.PASSWORD,
        //     },
        //   });
        this.emailVerifier = new EmailVerifier();
    }

    async verifyRecipients(recipients) {
        const verificationResults = await Promise.all(
            recipients.map(email => this.emailVerifier.verifyEmail(email))
        );

        return {
            validEmails: verificationResults
                .filter(result => result.isValid)
                .map(result => result.email),
            invalidEmails: verificationResults
                .filter(result => !result.isValid)
                .map(result => ({
                    email: result.email,
                    reason: result.reason
                }))
        };
    }

    async sendEmail(mailOptions) {
        return await this.transporter.sendMail(mailOptions);
    }

    prepareMailOptions(validEmails, subject, message, attachments = []) {
        return {
            from: process.env.EMAIL_FROM,
            bcc: validEmails.join(', '),
            subject: subject,
            text: message.replace(/<[^>]*>/g, ''),
            html: message,
            attachments: attachments.map(attachment => ({
                filename: attachment.filename,
                path: attachment.path
            }))
        };
    }
}

module.exports = EmailService;
