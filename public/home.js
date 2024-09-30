// Array containing car data
const cars = [
    {
      image: 'img/car-1.jpg',
      featuresLeft: [
        {
          icon: 'fas fa-trophy',
          title: 'First Class Services',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, in illum aperiam ullam magni eligendi?'
        },
        {
          icon: 'fas fa-shield-alt',
          title: '24/7 Road Assistance',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, in illum aperiam ullam magni eligendi?'
        }
      ],
      featuresRight: [
        {
          icon: 'fas fa-tag',
          title: 'Quality at Minimum',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, in illum aperiam ullam magni eligendi?'
        },
        {
          icon: 'fas fa-key',
          title: 'Free Pick-Up & Drop-Off',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, in illum aperiam ullam magni eligendi?'
        }
      ]
    },
    {
      image: 'img/car-2.jpg',
      featuresLeft: [
        {
          icon: 'fas fa-wrench',
          title: 'Engine Expertise',
          description: 'Our cars feature top-notch engines with high efficiency.'
        },
        {
          icon: 'fas fa-wifi',
          title: 'In-Car Wifi',
          description: 'Stay connected with our high-speed in-car wifi services.'
        }
      ],
      featuresRight: [
        {
          icon: 'fas fa-satellite-dish',
          title: 'Satellite Navigation',
          description: 'Real-time satellite navigation system with traffic updates.'
        },
        {
          icon: 'fas fa-shield-virus',
          title: 'Advanced Security',
          description: 'Full car security with theft alarms and automatic locking.'
        }
      ]
    },
    {
      image: 'img/car-3.jpg',
      featuresLeft: [
        {
          icon: 'fas fa-car-side',
          title: 'Sleek Design',
          description: 'The latest sleek design with aerodynamic features.'
        },
        {
          icon: 'fas fa-snowflake',
          title: 'Climate Control',
          description: 'Multi-zone climate control for a comfortable drive.'
        }
      ],
      featuresRight: [
        {
          icon: 'fas fa-music',
          title: 'Premium Sound System',
          description: 'Crystal clear audio with a 10-speaker sound system.'
        },
        {
          icon: 'fas fa-mobile-alt',
          title: 'Smartphone Integration',
          description: 'Fully integrated with Apple CarPlay and Android Auto.'
        }
      ]
    }
  ];
  
  let currentCarIndex = 0;
  
  // Elements from the DOM
  const carImage = document.getElementById('carImage');
  const featuresLeft = document.getElementById('featuresLeft');
  const featuresRight = document.getElementById('featuresRight');
  
  // Function to update the car's details
  function updateCar() {
    const car = cars[currentCarIndex];
  
    // Update the car image
    carImage.src = car.image;
  
    // Update the left side features
    featuresLeft.innerHTML = car.featuresLeft.map(feature => `
      <div class="feature-item">
        <i class="${feature.icon}"></i>
        <h2>${feature.title}</h2>
        <p>${feature.description}</p>
      </div>
    `).join('');
  
    // Update the right side features
    featuresRight.innerHTML = car.featuresRight.map(feature => `
      <div class="feature-item">
        <i class="${feature.icon}"></i>
        <h2>${feature.title}</h2>
        <p>${feature.description}</p>
      </div>
    `).join('');
  }
  
  // Add event listeners to buttons
  document.getElementById('nextBtn').addEventListener('click', () => {
    currentCarIndex = (currentCarIndex + 1) % cars.length; // Cycle through cars
    updateCar();
  });
  
  document.getElementById('prevBtn').addEventListener('click', () => {
    currentCarIndex = (currentCarIndex - 1 + cars.length) % cars.length; // Cycle backwards through cars
    updateCar();
  });
  
  // Initialize the first car on page load
  updateCar();
  
  function confirmLogout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/'; // Redirect to the login page
            } else {
                alert('Logout failed!');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const session = require('express-session');
const port = 4000;

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Use true in production with HTTPS
// }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
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
    res.sendFile(path.join(__dirname, '/index.html'));
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
        res.redirect('/home.html'); // Redirect to home page if login is successful
    } else if (!user.isActive) {
        res.send('<script>alert("Please verify your account first"); window.location.href = "/";</script>');
    } else {
        res.send('<script>alert("Your password is wrong"); window.location.href = "/";</script>');
    }
});
app.get('/logout', (req, res) => {
    // Clear the user session
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.sendFile(path.join(__dirname, '../public/index.html')); // Redirect to the index page after logout
      }
    });
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
        return res.redirect('/home.html');
    }
   
});
app.listen(port, () => {
    console.log("Server started on port", port);
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/');
    });
});


document.getElementById('reservationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        pickupLocation: document.getElementById('pickupLocation').value,
        dropoffLocation: document.getElementById('dropoffLocation').value,
        pickupDate: document.getElementById('pickupDate').value,
        dropoffDate: document.getElementById('dropoffDate').value,
        carType: document.getElementById('carType').value
    };

    try {
        const response = await fetch('/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('confirmationMessage').style.display = 'block';
        } else {
            alert('Failed to make a reservation. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});




document.getElementById('reservationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        pickupLocation: document.getElementById('pickupLocation').value,
        dropoffLocation: document.getElementById('dropoffLocation').value,
        pickupDate: document.getElementById('pickupDate').value,
        dropoffDate: document.getElementById('dropoffDate').value,
        carType: document.getElementById('carType').value
    };

    try {
        const response = await fetch('/submit-reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('confirmationMessage').style.display = 'block';
        } else {
            alert('Failed to make a reservation. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
