const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Email", emailSchema);
