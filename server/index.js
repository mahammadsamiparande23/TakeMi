// 1. Import packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');




// 2. Setup app
const app = express();

// 3. Import routes
const productRoutes = require('./routes/productRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes'); // ✅ NEW
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");


// 4. Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes); // ✅ NEW
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shop", shopRoutes);



// 5. Load .env and connect to MongoDB
dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ MalkHub Backend is Running on port ${process.env.PORT || 5000}`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
