const Booking = require('../models/bookingModel');

// POST - Create a booking
exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Service booked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Booking failed' });
  }
};

// GET - Get bookings by user
exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
};

// DELETE - Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Cancellation failed' });
  }
};
