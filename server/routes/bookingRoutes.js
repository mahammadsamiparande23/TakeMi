const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookingsByUser,
  cancelBooking
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/user/:userId', getBookingsByUser);
router.delete('/:id', cancelBooking);

module.exports = router;
