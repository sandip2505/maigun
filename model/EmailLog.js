const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  successful: [{ type: String }], // Array of successfully sent emails
  failed: [
    {
      email: { type: String, required: true },
      error: { type: String, required: true }
    }
  ],
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EmailLog", EmailLogSchema);
