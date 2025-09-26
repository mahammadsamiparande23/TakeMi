
const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  signupUser,
  loginUser,
  editProfile,
} = require("../controllers/userController");

// OTP routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Auth and profile routes
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.put("/edit/:id", editProfile);

module.exports = router;
