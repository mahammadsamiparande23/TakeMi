const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts } = require('../controllers/productController');

// 📌 Route to add product
router.post('/add', addProduct);

// ✅ Route to get all products
router.get('/all', getAllProducts);

module.exports = router;
