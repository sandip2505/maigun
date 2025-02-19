// controllers/controller.js
const Company = require('../model/company'); 
const EmailLog = require('../model/EmailLog'); 
const nodemailer = require('nodemailer');
const EmailService = require('../services/emailService');
const emailService = new EmailService();





exports.Home = async (req, res) => {
    try {
        // Fetch stats for home page
        const totalCompanies = await Company.countDocuments();
        
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const emailsSentToday = await EmailLog.countDocuments({
            createdAt: { $gte: today }
        });

        // Calculate success rate
        const totalEmailsToday = await EmailLog.countDocuments({
            createdAt: { $gte: today }
        });
        const successfulEmailsToday = await EmailLog.countDocuments({
            createdAt: { $gte: today },
            status: 'sent'
        });
        const successRate = totalEmailsToday ? 
            Math.round((successfulEmailsToday / totalEmailsToday) * 100) + '%' : 
            '0%';

        res.render('home', {
            title: 'Home',
            currentPage: 'home',
            totalCompanies,
            emailsSentToday,
            successRate
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).render('home', {
            title: 'Home',
            currentPage: 'home',
            error: 'Error loading dashboard data'
        });
    }
};

exports.companyRegistration = async (req, res) => {
    try {
        // Fetch any necessary data for the registration page
        // For example, you might want to show a list of existing companies
        const recentCompanies = await Company.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('company-registration', {
            title: 'Company Registration',
            currentPage: 'company-registration',
            recentCompanies
        });
    } catch (error) {
        console.error('Company registration page error:', error);
        res.status(500).render('company-registration', {
            title: 'Company Registration',
            currentPage: 'company-registration',
            error: 'Error loading registration page'
        });
    }
};

exports.emailSender = async (req, res) => {
    try {
        // Fetch all companies to populate the recipients dropdown
        const companies = await Company.find()
            .select('companyName email')
            .sort('companyName');

        // Fetch email templates if you have any
        const emailTemplates = []; // Add email templates if you have them

        res.render('email-sender', {
            title: 'Email Sender',
            currentPage: 'email-sender',
            companies,
            emailTemplates
        });
    } catch (error) {
        console.error('Email sender page error:', error);
        res.status(500).render('email-sender', {
            title: 'Email Sender',
            currentPage: 'email-sender',
            error: 'Error loading email sender page',
            companies: []
        });
    }
};

exports.emailLogs = async (req, res) => {
    try {
        // Get query parameters for filtering
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'all';
        const dateRange = req.query.dateRange || 'week';

        // Calculate date range
        let dateFilter = {};
        const now = new Date();
        if (dateRange === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: today } };
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: weekAgo } };
        } else if (dateRange === 'month') {
            const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
            dateFilter = { createdAt: { $gte: monthAgo } };
        }

        // Build status filter
        let statusFilter = {};
        if (status !== 'all') {
            statusFilter = { status: status };
        }

        // Combine filters
        const filter = { ...dateFilter, ...statusFilter };

        // Fetch email logs with pagination
        const emailLogs = await EmailLog.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('recipients', 'companyName email');

        // Get total count for pagination
        const totalLogs = await EmailLog.countDocuments(filter);
        const totalPages = Math.ceil(totalLogs / limit);

        res.render('email-logs', {
            title: 'Email Logs',
            currentPage: 'email-logs',
            emailLogs,
            pagination: {
                current: page,
                total: totalPages,
                limit
            },
            filters: {
                status,
                dateRange
            }
        });
    } catch (error) {
        console.error('Email logs page error:', error);
        res.status(500).render('email-logs', {
            title: 'Email Logs',
            currentPage: 'email-logs',
            error: 'Error loading email logs',
            emailLogs: []
        });
    }
};

exports.dashboard = async (req, res) => {
    try {
        // Fetch various statistics for the dashboard
        const stats = {
            totalCompanies: await Company.countDocuments(),
            // Get new companies registered in the last 30 days
            newCompanies: await Company.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }),
            // Email statistics
            emailStats: {
                total: await EmailLog.countDocuments(),
                sent: await EmailLog.countDocuments({ status: 'sent' }),
                failed: await EmailLog.countDocuments({ status: 'failed' }),
                pending: await EmailLog.countDocuments({ status: 'pending' })
            }
        };

        // Get monthly email statistics for chart
        const monthlyStats = await EmailLog.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    total: { $sum: 1 },
                    successful: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "sent"] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ]);

        // Recent activities
        const recentActivities = await Promise.all([
            // Get recent company registrations
            Company.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('companyName createdAt'),
            // Get recent emails
            EmailLog.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('recipients', 'companyName')
        ]);

        res.render('dashboard', {
            title: 'Dashboard',
            currentPage: 'dashboard',
            stats,
            monthlyStats,
            recentActivities: {
                companies: recentActivities[0],
                emails: recentActivities[1]
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('dashboard', {
            title: 'Dashboard',
            currentPage: 'dashboard',
            error: 'Error loading dashboard data'
        });
    }
};

// POST handlers for forms
exports.registerCompany = async (req, res) => {
    try {
        const company = new Company({
            companyName: req.body.companyName,
            companyNumber: req.body.companyNumber,
            email: req.body.email,
            address: req.body.address,
            website: req.body.website
        });

        await company.save();

        res.status(201).json({
            success: true,
            message: 'Company registered successfully',
            data: company
        });
    } catch (error) {
        console.error('Company registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering company',
            error: error.message
        });
    }
};

// exports.sendEmail = async (req, res) => {
//     try {
//         const emailLog = new EmailLog({
//             subject: req.body.subject,
//             message: req.body.message,
//             recipients: req.body.recipients,
//             status: 'pending'
//         });

//         await emailLog.save();

//         res.status(200).json({
//             success: true,
//             message: 'Email queued for sending',
//             data: emailLog
//         });
//     } catch (error) {
//         console.error('Email sending error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error sending email',
//             error: error.message
//         });
//     }
// };

exports.sendEmail = async (req, res) => {
    let emailLog;
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    try {
        // Validate request
        if (!req.body.subject || !req.body.message || !req.body.recipients) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Handle recipients - could be string, array, or JSON string
        let recipients;
        if (typeof req.body.recipients === 'string') {
            // If it's a comma-separated string, split it
            if (req.body.recipients.includes(',')) {
                recipients = req.body.recipients.split(',').map(email => email.trim());
            } else {
                // Check if it's a JSON string
                try {
                    recipients = JSON.parse(req.body.recipients);
                } catch (e) {
                    // If not JSON, treat it as a single email
                    recipients = [req.body.recipients];
                }
            }
        } else if (Array.isArray(req.body.recipients)) {
            recipients = req.body.recipients;
        } else {
            recipients = [req.body.recipients];
        }

        // Process attachments from req.files
        const attachments = req.files ? req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            contentType: file.mimetype
        })) : [];

        console.log('Processed recipients:', recipients);
        console.log('Processed attachments:', attachments);

        // Create email log
        emailLog = new EmailLog({
            subject: req.body.subject,
            message: req.body.message,
            recipients: recipients,
            status: 'pending',
            createdAt: new Date(),
            attachments: attachments
        });

        await emailLog.save();

        // Prepare and send email
        const mailOptions = emailService.prepareMailOptions(
            recipients,
            req.body.subject,
            req.body.message,
            attachments
        );

        const info = await emailService.sendEmail(mailOptions);

        // Update log with success
        emailLog.status = 'sent';
        emailLog.messageId = info.messageId;
        emailLog.sentAt = new Date();
        await emailLog.save();

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            data: {
                emailLog,
                messageId: info.messageId,
                recipients
            }
        });

    } catch (error) {
        console.error('Email sending error:', error);

        if (emailLog) {
            emailLog.status = 'failed';
            emailLog.error = error.message;
            await emailLog.save();
        }

        res.status(500).json({
            success: false,
            message: 'Error sending email',
            error: error.message
        });
    }
};
// Get email logs with pagination
exports.getEmailLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const logs = await EmailLog.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await EmailLog.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                logs,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalLogs: total
            }
        });
    } catch (error) {
        console.error('Error fetching email logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching email logs',
            error: error.message
        });
    }
};

// Get email log by ID
exports.getEmailLogById = async (req, res) => {
    try {
        const log = await EmailLog.findById(req.params.id);
        
        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Email log not found'
            });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error('Error fetching email log:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching email log',
            error: error.message
        });
    }
};