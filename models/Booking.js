// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  serviceListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceListing',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
