const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // ✅ MongoDB connection
const productRoutes = require('./routes/productRoutes'); // ✅ Our route

dotenv.config();

const app = express();
connectDB(); // ✅ Connect to DB

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);  // ✅ Add this line to connect the route

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
