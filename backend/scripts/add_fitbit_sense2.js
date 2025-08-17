// One-off script to add Fitbit Sense 2 to Wearables without duplicating existing data
// Usage: from backend directory, run `npm run add:fitbit`

require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');

(async () => {
  try {
    await connectDB();

    const doc = {
      name: 'Fitbit Sense 2',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
      description: 'Advanced health smartwatch with stress management, ECG, GPS, and multi-day battery life.',
      price: 299,
      countInStock: 35,
      category: 'Wearables'
    };

    const res = await Product.updateOne(
      { name: doc.name },
      { $setOnInsert: doc },
      { upsert: true }
    );

    if (res.upsertedCount && res.upsertedCount > 0) {
      console.log('✅ Inserted new product:', doc.name);
    } else if (res.matchedCount > 0) {
      console.log('ℹ️ Product already exists, no duplicate created:', doc.name);
    } else {
      console.log('ℹ️ Nothing changed.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add product:', err);
    process.exit(1);
  }
})();

