const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true, // Company name is mandatory
    trim: true,      // Remove leading/trailing spaces
    unique: true,   // Ensure company names are unique (optional, but often desirable)
  },
  companyNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Company number should be unique
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Email should be unique
    lowercase: true, // Store emails in lowercase for consistency
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation regex (can be improved)
  },
  address: {
    type: String,
    trim: true,
  },
 
  website: {
    type: String,
    trim: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now, 
  },
   
  

}, { timestamps: true }); 


// Create the Company model
const Company = mongoose.model('Company', companySchema);

module.exports = Company;