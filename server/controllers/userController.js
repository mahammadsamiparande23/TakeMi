const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    res.status(200).json({ message: "Login successful", user });
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

    res.status(200).json({ message: "OTP sent successfully" }); // 🚫 Don't expose OTP in production
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
