const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    isAdmin: true,
    address: {
      street: '123 Admin St',
      city: 'Admin City',
      state: 'AC',
      zipCode: '12345',
      country: 'USA'
    },
    phone: '+1-555-0001'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
    address: {
      street: '456 User Ave',
      city: 'User City',
      state: 'UC',
      zipCode: '67890',
      country: 'USA'
    },
    phone: '+1-555-0002'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    isAdmin: false,
    address: {
      street: '789 Customer Blvd',
      city: 'Customer City',
      state: 'CC',
      zipCode: '54321',
      country: 'USA'
    },
    phone: '+1-555-0003'
  }
];

const products = [
  // Smartphones Category
  {
    name: 'iPhone 15 Pro Max',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    description: 'The ultimate iPhone with titanium design, A17 Pro chip, and revolutionary camera system. Features ProRAW photography, 4K video recording, and Action Button.',
    price: 1199,
    countInStock: 25,
    category: 'Smartphones'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
    description: 'Premium Android flagship with S Pen, 200MP camera, AI-powered features, and titanium frame. Perfect for productivity and creativity.',
    price: 1299,
    countInStock: 20,
    category: 'Smartphones'
  },
  {
    name: 'Google Pixel 8 Pro',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    description: 'AI-powered smartphone with Magic Eraser, Best Take, and 7 years of OS updates. Pure Android experience with computational photography.',
    price: 999,
    countInStock: 30,
    category: 'Smartphones'
  },
  {
    name: 'OnePlus 12',
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop',
    description: 'Flagship killer with Snapdragon 8 Gen 3, 120Hz LTPO display, and ultra-fast charging. Premium performance at competitive price.',
    price: 799,
    countInStock: 35,
    category: 'Smartphones'
  },

  // Laptops Category
  {
    name: 'MacBook Pro 16" M3 Max',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
    description: 'Professional powerhouse with M3 Max chip, Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for creative professionals.',
    price: 2499,
    countInStock: 15,
    category: 'Laptops'
  },
  {
    name: 'Dell XPS 13 Plus',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
    description: 'Ultra-premium laptop with InfinityEdge display, 12th Gen Intel processors, and zero-lattice keyboard. Stunning design meets performance.',
    price: 1399,
    countInStock: 18,
    category: 'Laptops'
  },
  {
    name: 'Surface Laptop Studio 2',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
    description: 'Versatile 2-in-1 laptop with unique hinge design, touchscreen, Surface Pen support, and all-day battery life.',
    price: 1699,
    countInStock: 12,
    category: 'Laptops'
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop',
    description: 'Gaming laptop with AMD Ryzen 9, RTX 4070, and AniMe Matrix display. Compact powerhouse for gaming and content creation.',
    price: 1899,
    countInStock: 10,
    category: 'Laptops'
  },

  // Tablets Category
  {
    name: 'iPad Pro 12.9" M2',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    description: 'Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support. Perfect for creative work and productivity.',
    price: 1099,
    countInStock: 25,
    category: 'Tablets'
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
    description: 'Premium Android tablet with 14.6" AMOLED display, S Pen included, and DeX mode for desktop-like productivity.',
    price: 1199,
    countInStock: 20,
    category: 'Tablets'
  },
  {
    name: 'Microsoft Surface Pro 9',
    image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=400&fit=crop',
    description: 'Versatile 2-in-1 tablet with laptop performance, detachable keyboard, and Surface Pen support.',
    price: 999,
    countInStock: 18,
    category: 'Tablets'
  },

  // Audio Category
  {
    name: 'AirPods Pro 2nd Gen',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
    description: 'Premium wireless earbuds with adaptive noise cancellation, spatial audio, and MagSafe charging case.',
    price: 249,
    countInStock: 50,
    category: 'Audio'
  },
  {
    name: 'Sony WH-1000XM5',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery, and premium comfort.',
    price: 399,
    countInStock: 30,
    category: 'Audio'
  },
  {
    name: 'Bose QuietComfort Ultra',
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    description: 'Premium noise-canceling headphones with immersive audio, all-day comfort, and crystal-clear calls.',
    price: 429,
    countInStock: 25,
    category: 'Audio'
  },
  {
    name: 'Sennheiser Momentum 4',
    image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=400&fit=crop',
    description: 'Audiophile-grade wireless headphones with exceptional sound quality, 60-hour battery, and premium materials.',
    price: 349,
    countInStock: 20,
    category: 'Audio'
  },

  // Wearables Category
  {
    name: 'Apple Watch Ultra 2',
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
    description: 'Rugged smartwatch with titanium case, precision GPS, and advanced health monitoring. Built for extreme adventures.',
    price: 799,
    countInStock: 20,
    category: 'Wearables'
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    description: 'Premium smartwatch with rotating bezel, comprehensive health tracking, and seamless Android integration.',
    price: 429,
    countInStock: 25,
    category: 'Wearables'
  },
  {
    name: 'Garmin Fenix 7X',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop',
    description: 'Multi-sport GPS watch with solar charging, topographic maps, and advanced training metrics for serious athletes.',
    price: 899,
    countInStock: 15,
    category: 'Wearables'
  },
  {
    name: 'Fitbit Sense 2',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop',
    description: 'Advanced health smartwatch with stress management, ECG, GPS, and multi-day battery life.',
    price: 299,
    countInStock: 35,
    category: 'Wearables'
  },


  // Gaming Category
  {
    name: 'PlayStation 5 Slim',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
    description: 'Next-gen gaming console with ultra-high speed SSD, ray tracing, and 3D audio. Experience gaming like never before.',
    price: 499,
    countInStock: 30,
    category: 'Gaming'
  },
  {
    name: 'Xbox Series X',
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop',
    description: 'Most powerful Xbox ever with 4K gaming, 120fps, and Quick Resume. Includes Game Pass Ultimate.',
    price: 499,
    countInStock: 25,
    category: 'Gaming'
  },
  {
    name: 'Nintendo Switch OLED',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    description: 'Hybrid gaming console with vibrant 7-inch OLED screen, enhanced audio, and versatile play modes.',
    price: 349,
    countInStock: 40,
    category: 'Gaming'
  },
  {
    name: 'Steam Deck OLED',
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
    description: 'Portable PC gaming device with OLED display, custom AMD APU, and access to your entire Steam library.',
    price: 649,
    countInStock: 20,
    category: 'Gaming'
  },

  // Accessories Category
  {
    name: 'Magic Keyboard for iPad Pro',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop',
    description: 'Premium keyboard with trackpad, backlit keys, and floating cantilever design. Perfect companion for iPad Pro.',
    price: 349,
    countInStock: 30,
    category: 'Accessories'
  },
  {
    name: 'Logitech MX Master 3S',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    description: 'Advanced wireless mouse with ultra-precise scrolling, customizable buttons, and multi-device connectivity.',
    price: 99,
    countInStock: 45,
    category: 'Accessories'
  },
  {
    name: 'Anker PowerCore 26800',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop',
    description: 'High-capacity portable charger with fast charging technology. Keep all your devices powered on the go.',
    price: 79,
    countInStock: 60,
    category: 'Accessories'
  },
  {
    name: 'USB-C Hub 7-in-1',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop',
    description: 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and fast charging. Essential for modern laptops.',
    price: 59,
    countInStock: 40,
    category: 'Accessories'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Hash passwords for users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`👥 Seeded ${createdUsers.length} users`);

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Seeded ${createdProducts.length} products`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

