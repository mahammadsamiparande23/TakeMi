// server/routes/userRoutes.js (UPDATED)

const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  signupUser,
  loginUser,
  editProfile,
  googleLogin, // ✅ NEW: Import the Google login function
} = require("../controllers/userController");

// OTP routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Auth and profile routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// ✅ NEW: Google Sign-In Endpoint
router.post("/google-login", googleLogin); 

router.put("/edit/:id", editProfile);

module.exports = router;