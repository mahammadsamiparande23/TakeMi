const Service = require("../models/serviceModel");

const addService = async (req, res) => {
  try {
    const { name, category, price, experience, vendorName, image } = req.body;

    const newService = new Service({
      name,
      category: category || "General",
      price,
      experience: experience || "0 years",
      vendorName,
      image
    });

    await newService.save();
    res.status(201).json({ success: true, message: "Service added", service: newService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding service", error });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services" });
  }
};

// ✅ Must export like this
module.exports = {
  addService,
  getAllServices
};
