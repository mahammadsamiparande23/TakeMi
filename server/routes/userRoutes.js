const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  signupUser,
  loginUser,
  editProfile,
  googleLogin,
  // ✅ FIX: Added the missing admin and vendor login/signup imports
  adminLogin,
  vendorSignup,
  vendorLogin,
} = require("../controllers/userController");

// Import your authentication middleware (bouncer)
const { verifyToken } = require('../middlewares/authMiddleware'); 

// Placeholder function to return protected user data
const getProfile = (req, res) => {
    // Data comes from the JWT payload after verification by verifyToken
    return res.status(200).json({ 
        message: "Protected data access granted.",
        user: req.user 
    });
};

// ====================== AUTHENTICATION ROUTES ======================

// Standard User Auth
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin); 

// OTP Routes (often used for password reset/quick login)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Vendor Auth
router.post("/vendor-signup", vendorSignup);
router.post("/vendor-login", vendorLogin);

// ✅ CRITICAL FIX: Admin Auth Route
router.post("/admin-login", adminLogin); 


// ====================== PROTECTED ROUTES ======================

// Protected Profile Retrieval
router.get("/profile", verifyToken, getProfile);

// Protected Profile Update
router.put("/edit/:id", editProfile);

module.exports = router;