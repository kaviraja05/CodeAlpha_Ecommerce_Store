const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: String,
  description: String,
  price: {
    type: Number,
    required: true
  },
  countInStock: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Wearables', 'Gaming', 'Accessories'],
    default: 'Accessories'
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
