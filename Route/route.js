// app.js or routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/countroller');

// Home page
router.get('/', controller.Home);

// Company Registration
router.get('/company-registration', controller.companyRegistration);
router.post('/company-registration', controller.registerCompany);

// Email Sender
router.get('/email-sender', controller.emailSender);
router.post('/email-sender', controller.sendEmail);

// Email Logs
router.get('/email-logs', controller.emailLogs);
router.get('/log', controller.getEmailLogs);

// Dashboard
router.get('/dashboard', controller.dashboard);

module.exports = router;