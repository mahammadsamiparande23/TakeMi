const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken'); 
require("dotenv").config();

// ====================== GOOGLE SIGN-IN IMPORTS =========================
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
const client = new OAuth2Client(CLIENT_ID);


// ====================== JWT TOKEN GENERATION HELPER =========================
const generateAuthToken = (user) => {
    // Includes user role in the JWT payload
    return jwt.sign(
        { _id: user._id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET,             
        { expiresIn: '7d' }                 
    );
};


// Helper to check if OTP is expired (5 minutes)
const isExpired = (createdAt) => {
    const now = Date.now();
    const expirationTime = 5 * 60 * 1000; // 5 minutes in ms
    return now - new Date(createdAt).getTime() > expirationTime;
};

// ====================== USER SIGNUP =========================
const signupUser = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, mobile, password: hashedPassword }); 

        await user.save();
        const authToken = generateAuthToken(user); 

        res.status(201).json({ 
            message: "Signup successful", 
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role 
            }
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: "Signup failed" });
    }
};

// ======================= USER LOGIN =========================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });
        if (user.googleId && !user.password) {
            return res.status(401).json({ message: "User signed up with Google. Please use Google Sign-In." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const authToken = generateAuthToken(user); 
        const category = user.role === 'vendor' && user.vendorDetails ? user.vendorDetails.category : undefined;

        res.status(200).json({ 
            message: "Login successful", 
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                category: category
            } 
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
};


// ======================= SEND OTP =====================
const sendOtp = async (req, res) => {
    const { email } = req.body;
    // Check if user exists before sending OTP (login flow)
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "No account found with this email." });
    }

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
            subject: "Your MalkHub OTP Code",
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

// ======================= VERIFY OTP (Issues JWT) =====================
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const entry = await Otp.findOne({ email });

        if (!entry || isExpired(entry.createdAt)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        if (entry.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await Otp.deleteOne({ email });
        
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please sign up with email/password first." });
        }

        const authToken = generateAuthToken(user);
        const category = user.role === 'vendor' && user.vendorDetails ? user.vendorDetails.category : undefined;

        res.status(200).json({ 
            message: "OTP verified successfully. Logged in.",
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                category: category 
            }
        });
    } catch (err) {
        console.error("OTP verify error:", err);
        res.status(500).json({ message: "Error verifying OTP" });
    }
};


// ======================= GOOGLE SIGN-IN/SIGNUP =====================
const googleLogin = async (req, res) => {
    const { idToken } = req.body; 

    if (!idToken) {
        return res.status(400).json({ message: 'Missing Google ID token' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID, 
        });

        const googlePayload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = googlePayload;

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // Google SIGNUP: Creates a new user with default 'user' role.
            user = await User.create({
                email,
                name,
                googleId,
                profilePicture: picture,
                role: 'user' // Default to 'user' for Google signups
            });
        } else if (!user.googleId) {
            // Existing email/password user linked their account (Google LOGIN)
            user.googleId = googleId;
            user.profilePicture = user.profilePicture || picture; 
            await user.save();
        }
        
        // If the user is a vendor, grab the category for the dashboard.
        const category = user.role === 'vendor' && user.vendorDetails ? user.vendorDetails.category : undefined;


        const authToken = generateAuthToken(user); 

        res.status(200).json({ 
            message: 'Google login successful', 
            token: authToken, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, 
                category: category
            }
        });

    } catch (error) {
        console.error('Google Sign-In Verification Error:', error.message);
        res.status(401).json({ message: 'Authentication failed: Invalid Google ID Token.' });
    }
};

// ======================= VENDOR SIGNUP =========================
const vendorSignup = async (req, res) => {
    try {
        const { name, email, mobile, password, shopName, category, location } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ 
            name, 
            email, 
            mobile, 
            password: hashedPassword,
            role: 'vendor', 
            vendorDetails: { shopName, category, location } 
        }); 

        await user.save();
        const authToken = generateAuthToken(user); 

        res.status(201).json({ 
            message: "Vendor signup successful", 
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, 
                category: category 
            } 
        });
    } catch (err) {
        console.error("Vendor signup error:", err);
        res.status(500).json({ error: "Vendor signup failed" });
    }
};

// ======================= VENDOR LOGIN =========================
const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.role !== 'vendor') {
            return res.status(401).json({ message: "Invalid credentials or not a vendor" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

        const authToken = generateAuthToken(user); 
        
        const category = user.vendorDetails ? user.vendorDetails.category : 'default';

        res.status(200).json({ 
            message: "Vendor login successful", 
            token: authToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, 
                category: category 
            } 
        });
    } catch (err) {
        console.error("Vendor login error:", err);
        res.status(500).json({ error: "Vendor login failed" });
    }
};


// ======================= ADMIN LOGIN =========================
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // ⚠️ WARNING: Using hardcoded credentials for demo. 
        if (username !== "admin" || password !== "malk@123") {
            return res.status(401).json({ message: "Invalid Admin Credentials" });
        }

        // Mock Admin User Object for JWT Generation:
        const adminUser = { 
            _id: 'admin_id_001', 
            email: 'admin@malkhub.com', 
            name: 'MalkHub Admin',
            role: 'admin' 
        };

        const authToken = generateAuthToken(adminUser);

        res.status(200).json({ 
            message: "Admin login successful", 
            token: authToken,
            user: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role 
            } 
        });
    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ error: "Admin login failed" });
    }
};

// ======================= EDIT PROFILE (Placeholder) =========================
const editProfile = async (req, res) => {
    // Placeholder implementation, assuming logic will be added here
    return res.status(200).json({ message: "Edit profile endpoint hit." });
};

// ======================= FINAL EXPORTS =========================
// ✅ FIX: Export all functions which are now defined as local constants
module.exports = {
    signupUser,
    loginUser,
    sendOtp,
    verifyOtp,
    googleLogin,
    vendorSignup,
    vendorLogin,
    adminLogin, 
    editProfile,
};