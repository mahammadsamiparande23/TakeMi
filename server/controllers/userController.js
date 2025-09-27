// server/controllers/userController.js (UPDATED - Entire Content)

const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken'); // ✅ NEW IMPORT
require("dotenv").config();

// ====================== GOOGLE SIGN-IN IMPORTS =========================
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
const client = new OAuth2Client(CLIENT_ID);


// ====================== JWT TOKEN GENERATION HELPER =========================
const generateAuthToken = (user) => {
    // Generates a JWT token using the secret from your .env
    return jwt.sign(
        { _id: user._id, email: user.email }, // Payload
        process.env.JWT_SECRET,             // Secret
        { expiresIn: '7d' }                 // Token expiration
    );
};


// Helper to check if OTP is expired (5 minutes)
const isExpired = (createdAt) => {
    const now = Date.now();
    const expirationTime = 5 * 60 * 1000; // 5 minutes in ms
    return now - new Date(createdAt).getTime() > expirationTime;
};

// ====================== SIGNUP =========================
exports.signupUser = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Note: The mobile and password fields are now optional in the model
        const user = new User({ name, email, mobile, password: hashedPassword }); 

        await user.save();
        res.status(201).json({ message: "Signup successful", user });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
    }
};

// ======================= LOGIN =========================
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        // Prevent Google sign-up users from using this endpoint without a password
        if (user.googleId && !user.password) {
            return res.status(401).json({ message: "User signed up with Google. Please use Google Sign-In." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        // Generate JWT token on successful password login
        const authToken = generateAuthToken(user); 

        res.status(200).json({ message: "Login successful", user, token: authToken });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
};

// ======================= EDIT PROFILE =====================
exports.editProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        const updates = { name, email };
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updates.password = hashed;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "Profile updated", user: updatedUser });
    } catch (err) {
        console.error("Profile update error:", err);
        res.status(500).json({ error: "Update failed" });
    }
};

// ======================= SEND OTP =====================
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
        });

        await Otp.findOneAndUpdate(
            { email },
            { email, otp, createdAt: new Date() },
            { upsert: true }
        );

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("OTP send error:", err);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

// ======================= VERIFY OTP =====================
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const entry = await Otp.findOne({ email });

        if (!entry) {
            return res.status(400).json({ message: "OTP not found or expired" });
        }

        if (entry.otp !== otp || isExpired(entry.createdAt)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await Otp.deleteOne({ email });

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error("OTP verify error:", err);
        res.status(500).json({ message: "Error verifying OTP" });
    }
};


// ======================= GOOGLE SIGN-IN (NEW ENDPOINT LOGIC) =====================
exports.googleLogin = async (req, res) => {
    // Client sends the ID token in the request body
    const { idToken } = req.body; 

    if (!idToken) {
        return res.status(400).json({ message: 'Missing Google ID token' });
    }

    try {
        // 1. Verify the ID Token with Google
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID, // Ensures the token is for your app
        });

        const googlePayload = ticket.getPayload();
        
        // Extract key user data from the verified token
        const { sub: googleId, email, name, picture } = googlePayload;

        // 2. Find or Create the user in your database
        // Check by Google ID (if already linked) or email (to link an existing account)
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // User does not exist, create a new social account
            user = await User.create({
                email,
                name,
                googleId,
                profilePicture: picture,
                // password and mobile are not set, which is fine based on the updated model schema
            });
        } else if (!user.googleId) {
            // User exists via email/password, but hasn't linked Google yet. Link it now.
            user.googleId = googleId;
            user.profilePicture = user.profilePicture || picture; // Preserve existing picture if it exists
            await user.save();
        }

        // 3. Generate your application's JWT
        const authToken = generateAuthToken(user); 

        // 4. Send success response
        res.status(200).json({ 
            message: 'Google login successful', 
            token: authToken, // Return your app's auth token
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                // ... other necessary user fields
            }
        });

    } catch (error) {
        console.error('Google Sign-In Verification Error:', error.message);
        // Respond with an unauthorized error if token verification fails
        res.status(401).json({ message: 'Authentication failed: Invalid Google ID Token.' });
    }
};