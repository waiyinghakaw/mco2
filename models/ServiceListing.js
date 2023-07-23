const mongoose = require('mongoose');

const serviceListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
});

// Create and export the 'ServiceListing' model
const ServiceListing = mongoose.model('ServiceListing', serviceListingSchema);
module.exports = ServiceListing;
