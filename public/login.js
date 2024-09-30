const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const session = require('express-session');
const port = 3000;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use true in production with HTTPS
}));

mongoose.connect("mongodb+srv://ganeshyadavudl:H7UQAdi4xrjsyCSQ@ganesh.pgf9yg2.mongodb.net/?retryWrites=true&w=majority&appName=Ganesh", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.once('open', () => {
    console.log("MongoDB connection successful");
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    otp: String,
    otpExpiration: Date,
    isActive: Boolean,
    resetToken: String,
    resetTokenExpiration: Date
});

const Users = mongoose.model("Users", userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/Login.html'));
});

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const existingUser = await Users.findOne({ email });

    if (existingUser) {
        res.status(400).send('You already have an account');
    } else {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
        const otpExpiration = Date.now() + 3600000; // OTP valid for 1 hour

        const user = new Users({
            name,
            email,
            password,
            otp,
            otpExpiration,
            isActive: false
        });
        await user.save();

        // Set up nodemailer
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rgmlucifer@gmail.com',
                pass: 'grozgwifmcmlnxsa'
            }
        });

        // Email content
        let mailOptions = {
            from: 'rgmlucifer@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for account verification is: ${otp}`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Email sent: ' + info.response);
            res.sendStatus(200);
        });
    }
});

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const user = await Users.findOne({ email, otp, otpExpiration: { $gt: Date.now() } });

    if (user) {
        user.otp = undefined;
        user.otpExpiration = undefined;
        user.isActive = true;
        await user.save();

        res.send('<script>alert("OTP verified successfully. Your account is now active."); window.location.href = "/";</script>');
    } else {
        res.send('<script>alert("Invalid or expired OTP"); window.location.href = "/";</script>');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (user && user.password === password && user.isActive) {
        req.session.user = user; // Store user data in session
        res.redirect('/home'); // Redirect to home page if login is successful
    } else if (!user.isActive) {
        res.send('<script>alert("Please verify your account first"); window.location.href = "/";</script>');
    } else {
        res.send('<script>alert("Your password is wrong"); window.location.href = "/";</script>');
    }
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (user) {
        const token = crypto.randomBytes(20).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rgmlucifer@gmail.com',
                pass: 'grozgwifmcmlnxsa'
            }
        });

        let mailOptions = {
            from: 'rgmlucifer@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Use this token to reset your password: ${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Email sent: ' + info.response);
            res.sendStatus(200);
        });
    } else {
        res.status(400).send('No account with that email found');
    }
});

app.post('/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;
    const user = await Users.findOne({ email, resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (user) {
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.send('<script>alert("Password has been reset successfully"); window.location.href = "/";</script>');
    } else {
        res.send('<script>alert("Invalid or expired token"); window.location.href = "/";</script>');
    }
});

app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.send(`<h1>Welcome to the Home Page, ${req.session.user.name}!</h1>`);
});

app.listen(port, () => {
    console.log("Server started on port", port);
});
