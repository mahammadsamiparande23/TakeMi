const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  password: {
    type: String,
    required: true
  },
  location: String,
  services: [String], // e.g., ["grocery", "salon"]
  isApproved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Shop", shopSchema);
