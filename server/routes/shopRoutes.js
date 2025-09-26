const express = require("express");
const { registerShop, loginShop, approveShop } = require("../controllers/shopController");
const { verifyAdmin } = require("../middlewares/authMiddleware"); // 👈 import middleware


const router = express.Router();

router.post("/register", registerShop);
router.post("/login", loginShop);

router.put("/approve/:shopId", verifyAdmin, approveShop); // 👈 only admin can approve


module.exports = router;
