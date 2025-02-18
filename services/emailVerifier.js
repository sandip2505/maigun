const dns = require('dns');
const net = require('net');
const { promisify } = require('util');
const resolveMxPromise = promisify(dns.resolveMx);

class EmailVerifier {
    constructor() {
        this.disposableEmailDomains = [
            'tempmail.com', 'temp-mail.org', 'throwawaymail.com',
            'mailinator.com', 'guerrillamail.com', 'sharklasers.com',
            'example.com', 'test.com'
        ];
    }

    async verifyEmail(email) {
        try {
            const result = {
                email,
                isValid: false,
                reason: null,
                isDisposable: false
            };

            if (!this.isValidFormat(email)) {
                result.reason = 'Invalid email format';
                return result;
            }

            const domain = email.split('@')[1];
            if (this.isDisposableEmail(domain)) {
                result.isDisposable = true;
                result.reason = 'Disposable email detected';
                return result;
            }

            const hasMx = await this.checkMxRecord(domain);
            if (!hasMx) {
                result.reason = 'Domain does not have valid MX records';
                return result;
            }

            result.isValid = true;
            return result;
        } catch (error) {
            return {
                email,
                isValid: false,
                reason: 'Verification error: ' + error.message,
                isDisposable: false
            };
        }
    }

    isValidFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isDisposableEmail(domain) {
        return this.disposableEmailDomains.includes(domain.toLowerCase());
    }

    async checkMxRecord(domain) {
        try {
            const mxRecords = await resolveMxPromise(domain);
            return mxRecords && mxRecords.length > 0;
        } catch (error) {
            return false;
        }
    }
}

module.exports = EmailVerifier;
