const express = require('express');
const router = express.Router();

// ✅ Import the controller functions
const { addService, getAllServices } = require('../controllers/serviceController');

// ✅ Use them in the routes
router.post('/', addService);
router.get('/', getAllServices);

module.exports = router;
