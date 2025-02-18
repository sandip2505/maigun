const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./db/db");
const Email = require("./model/mail");
const EmailLog = require("./model/EmailLog");
const Router = require("./Route/route");
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

app.use("/", Router);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
