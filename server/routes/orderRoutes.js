const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');

// 🛒 POST: Place an order
router.post('/', async (req, res) => {
  try {
    const { userId, products } = req.body;

    // Validate input
    if (!userId || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: "userId and products are required" });
    }

    const newOrder = new Order({ userId, products });
    await newOrder.save();

    res.status(201).json({ message: "✅ Order placed", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to place order", details: err.message });
  }
});

// 📦 GET: Get orders for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId in URL" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch orders", details: err.message });
  }
});

module.exports = router;
