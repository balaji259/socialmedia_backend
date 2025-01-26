
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/otp');
const router = express.Router();
const authenticateUser = require("./authenticate_user");


// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'getsetotp@gmail.com', // Replace with your email
        pass: 'cokobcdridsvwjoo', // Replace with your app-specific password
    },
});

router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    try {
        // Save OTP to the database
        await Otp.create({ email, otp, expiry });

        // Send the OTP via email
        await transporter.sendMail({
            from: 'getsetotp@gmail.com', // Replace with your email
            to: email,
            subject: 'Your OTP for Registration',
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP. Try again later.' });
    }
});

router.post('/validate-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        // Find OTP record in the database
        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Check if OTP has expired
        if (new Date() > otpRecord.expiry) {
            await Otp.deleteOne({ _id: otpRecord._id }); // Clean up expired OTP
            return res.status(400).json({ error: 'OTP has expired' });
        }

        // OTP is valid
        await Otp.deleteOne({ _id: otpRecord._id }); // Remove OTP after successful validation
        res.status(200).json({ message: 'OTP validated successfully' });
    } catch (error) {
        console.error('Error validating OTP:', error);
        res.status(500).json({ error: 'Failed to validate OTP. Try again later.' });
    }
});



// Registration Route
router.post('/register', async (req, res) => {
    console.log("entered route");
    const { username, fullname, email, password } = req.body;

    try {
        // Check if user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered. Please use a different email.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user instance
        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword, // Save hashed password
        });

        // Save the new user to the database
        await newUser.save();

        // Create a JWT payload with the username and email
        const payload = {
            userId:newUser._id,
            username: newUser.username,
            email: newUser.email,
        };

        // Generate a JWT token that expires in 6 hours
        const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:'30d'});

        // Respond with the generated token
        return res.status(201).json({
            token, 
            payload,
            message: 'Registration successful!',
        });

    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ error: 'Error registering user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("email not regstereed");
            return res.status(401).json({ error: 'Email not registered' });
        }

        // Verify the password
        if(password){
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            console.log("password incorrect");
            return res.status(401).json({ error: 'Invalid password' });
        }
        }

        // Define token payload (you can include more user info if needed)
        const payload = {
            userId:user._id,
            username: user.username,
            email: user.email,
        };
        // Generate JWT token
        const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:'30d'});


        // Send token to the client
        res.json({ token,payload });
        
    } catch (error) {
        console.error('Error during login:', error);
        console.log(error);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get("/userId",authenticateUser,async(req,res)=>{
    res.status(200).json(req.user.userId);
})

router.get("/user",authenticateUser,async(req,res)=>{
    res.status(200).json(req.user);
})

module.exports = router;
