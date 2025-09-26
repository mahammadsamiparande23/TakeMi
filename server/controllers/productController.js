const Product = require('../models/productModel');

// ✅ Controller: Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name, category, price, description,
      vendorName, shopName, contactNumber, village, image
    } = req.body;

    const newProduct = new Product({
      name, category, price, description,
      vendorName, shopName, contactNumber, village, image
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });

  } catch (err) {
    res.status(500).json({ error: "Error adding product" });
  }
};

// ✅ Controller: Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

module.exports = {
  addProduct,
  getAllProducts
};
