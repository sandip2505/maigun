const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./db/db");
const Email = require("./model/mail");
const EmailLog = require("./model/EmailLog");
dotenv.config();
const app = express();

connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

app.get("/", (req, res) => {
  res.render("index");
})
app.get("/admin", async (req, res) => {
  const emailLog = await EmailLog.find();
  console.log(emailLog, "email_log");
  res.render("admin", { emailLog });
})
app.get("/mail", async (req, res) => {
  try {

    const emailLog = await EmailLog.find();
    console.log(emailLog, "email_log");
    res.render("email_log", { emailLog });
  } catch (error) {

  }
})
app.post("/", (req, res) => {
  const { email, subject, message } = req.body;
  res.redirect("/");
})

app.post("/send-mails", async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    // Validate input
    if (!email || !Array.isArray(email) || email.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No email addresses provided",
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: "Subject is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Track successful and failed emails
    const results = {
      successful: [],
      failed: [],
    };

    // Send emails in parallel with individual error handling
    const sendEmailPromises = email.map(async (emailAddress) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: emailAddress,
          subject: subject,
          html: message, // Changed from text to html to support CKEditor content
          replyTo: "sandipganava1234@gmail.com",
        });
        results.successful.push(emailAddress);
      } catch (error) {
        results.failed.push({
          email: emailAddress,
          error: error.message,
        });
      }
    });

    // Wait for all email sending attempts to complete
    await Promise.all(sendEmailPromises);

    // Save the email log to MongoDB
    const emailLog = new EmailLog({
      subject,
      message,
      successful: results.successful,
      failed: results.failed,
    });

    await emailLog.save();

    // Prepare response based on results
    if (results.failed.length === 0) {
      res.json({
        success: true,
        message: "All emails sent successfully!",
        results,
      });
    } else if (results.successful.length === 0) {
      res.status(500).json({
        success: false,
        error: "Failed to send any emails",
        results,
      });
    } else {
      res.status(207).json({
        success: true,
        message: "Some emails were sent successfully",
        results,
      });
    }
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while sending emails",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
