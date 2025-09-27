// server/routes/userRoutes.js (ADD THE NEW CODE)

const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  signupUser,
  loginUser,
  editProfile,
  googleLogin,
} = require("../controllers/userController");

// 1. ✅ IMPORT THE BOUNCER (Middleware)
const { verifyToken } = require('../middlewares/authMiddleware'); // Check the path to your authMiddleware.js

// 2. ✅ DEFINE THE PROFILE LOGIC
const getProfile = (req, res) => {
    // This data (req.user) comes from the JWT payload after verification
    return res.status(200).json({ 
        message: "Protected data access granted.",
        user: req.user 
    });
};

// ... existing routes ...

// OTP routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Auth and profile routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// Google Sign-In Endpoint
router.post("/google-login", googleLogin); 

// 3. ✅ ADD THE PROTECTED PROFILE ROUTE
// It must pass the verifyToken middleware first
router.get("/profile", verifyToken, getProfile);

router.put("/edit/:id", editProfile);

module.exports = router;