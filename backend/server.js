const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); 
const connectDB = require('./config/db');

// Import routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: '🌐 TechSphere API is running...',
    version: '1.0.0',
    status: 'active',
    description: 'Premium Tech Marketplace API'
  });
});

// ✅ Serve frontend (after APIs)
app.use(express.static(path.join(__dirname, '../frontend-vanilla')));

// ✅ Fallback for all non-API routes → load frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-vanilla/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
//app.use('*', (req, res) => {
//  res.status(404).json({ message: 'Route not found' });
//});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});
