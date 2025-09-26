const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: String,
  experience: String,
  vendorName: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Service", serviceSchema);
