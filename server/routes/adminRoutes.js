const express = require("express");
const router = express.Router();

const {
  loginAdmin,
  viewAllShops,
  approveShop,
} = require("../controllers/adminController");
//cHANGE
const {
  verifyAdmin,
  verifyVendor,
} = require("../middlewares/authMiddleware");

// Admin Login (no auth needed)
router.post("/login", loginAdmin);

// View All Shops (admin only)
router.get("/shops", verifyAdmin, viewAllShops);

// Approve Shop (admin only)
router.put("/approve/:shopId", verifyAdmin, approveShop);

module.exports = router;
