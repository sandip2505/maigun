// app.js or routes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controller/countroller');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  });
  
// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Home page
router.get('/', controller.Home);

// Company Registration
router.get('/company-registration', controller.companyRegistration);
router.post('/company-registration', controller.registerCompany);
router.get('/companylist', controller.companyList);

// Email Sender
router.get('/email-sender', controller.emailSender);
router.post('/email-sender',upload.array('attachments'), controller.sendEmail);

// Email Logs
router.get('/email-logs', controller.emailLogs);
router.get('/log', controller.getEmailLogs);

// Dashboard
router.get('/dashboard', controller.dashboard);

module.exports = router;