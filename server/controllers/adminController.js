const Admin = require("../models/adminModel");
const Shop = require("../models/shopModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, adminId: admin._id });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// View All Shops
const viewAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shops" });
  }
};

// Approve Shop
const approveShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    await Shop.findByIdAndUpdate(shopId, { isApproved: true });
    res.status(200).json({ message: "Shop approved" });
  } catch (error) {
    res.status(500).json({ error: "Approval failed" });
  }
};

module.exports = {
  loginAdmin,
  viewAllShops,
  approveShop,
};
