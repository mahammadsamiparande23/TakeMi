const Shop = require("../models/shopModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Shop
const registerShop = async (req, res) => {
  try {
    const { shopName, ownerName, email, phone, password, location, services } = req.body;

    const existingShop = await Shop.findOne({ email });
    if (existingShop)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newShop = await Shop.create({
      shopName,
      ownerName,
      email,
      phone,
      password: hashedPassword,
      location,
      services,
    });

    res.status(201).json({ message: "Shop registered successfully", shop: newShop });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// ✅ Login Shop
const loginShop = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with:", email, password);

    const shop = await Shop.findOne({ email });
    if (!shop) {
      console.log("Shop not found");
      return res.status(404).json({ message: "Shop not found" });
    }

    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: shop._id, role: "vendor" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, shopId: shop._id, isApproved: shop.isApproved });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};


// ✅ Approve Shop (Admin Only)
const approveShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    shop.isApproved = true;
    await shop.save();

    res.status(200).json({ message: "Shop approved successfully", shop });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve shop" });
  }
};

// ✅ Export all in one place
module.exports = {
  registerShop,
  loginShop,
  approveShop,
};
