# 🌐 TechSphere - Premium Tech Marketplace

A modern, full-stack ecommerce web application built with vanilla HTML, CSS, JavaScript frontend and Express.js backend with MongoDB database. Your premier destination for cutting-edge technology and premium digital lifestyle products.

## 🚀 Features

### ✅ Core Functionality
- **Product Catalog**: Browse products with search, filtering, and pagination
- **Product Details**: Detailed product pages with images, descriptions, and stock info
- **Shopping Cart**: Add/remove items, update quantities, and view cart summary
- **User Authentication**: Secure registration and login with JWT tokens
- **Order Processing**: Complete checkout flow with shipping information
- **Responsive Design**: Mobile-friendly interface that works on all devices

### 🎨 UI/UX Highlights
- Clean, modern design with consistent color palette
- Smooth animations and hover effects
- Intuitive navigation with breadcrumbs
- Toast notifications for user feedback
- Loading states and error handling
- Keyboard shortcuts for power users

### 🔐 Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Input validation and sanitization
- CORS protection
- Secure API endpoints

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Styling** | Custom CSS with CSS Variables |
| **Icons** | Font Awesome |
| **Fonts** | Google Fonts (Inter) |

## 📁 Project Structure

```
TechSphere_Ecommerce_Store/
├── backend/                 # Express.js backend
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── models/
│   │   ├── User.js         # User model
│   │   ├── Product.js      # Product model
│   │   ├── Cart.js         # Shopping cart model
│   │   └── Order.js        # Order model
│   ├── routes/
│   │   ├── authRoutes.js   # Authentication routes
│   │   ├── productRoutes.js # Product routes
│   │   ├── cartRoutes.js   # Cart management routes
│   │   └── orderRoutes.js  # Order processing routes
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seeding script
│   └── package.json        # Backend dependencies
├── frontend-vanilla/        # Vanilla JS frontend
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   ├── config.js       # App configuration
│   │   ├── api.js          # API service layer
│   │   ├── auth.js         # Authentication logic
│   │   ├── cart.js         # Cart management
│   │   ├── products.js     # Product functionality
│   │   ├── checkout.js     # Checkout process
│   │   └── app.js          # Main app initialization
│   ├── index.html          # Main HTML file
│   └── serve.js            # Development server
└── README.md               # Project documentation

Note: The `frontend/` directory contains an old React implementation and can be safely removed.
The main application uses the `frontend-vanilla/` directory.
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CodeAlpha_Ecommerce_Store.git
   cd CodeAlpha_Ecommerce_Store
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Seed the Database**
   ```bash
   npm run seed
   ```

5. **Start the Backend Server**
   ```bash
   npm start
   ```

6. **Start the Frontend Server**

   Open a new terminal:
   ```bash
   cd frontend-vanilla
   node serve.js
   ```

7. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Sample Data

The application comes with pre-seeded data including:

### Sample Users
- **Admin**: admin@example.com / admin123
- **User 1**: john@example.com / password123
- **User 2**: jane@example.com / password123

### Sample Products
- Electronics (iPhone, Samsung Galaxy, MacBook, etc.)
- Accessories (AirPods, Apple Watch, Headphones)
- Gaming (Nintendo Switch)
- E-readers (Kindle Paperwhite)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with pagination, search, filters)
- `GET /api/products/:id` - Get single product

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders (Protected)
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order

## 🎯 Key Features Walkthrough

### 1. Product Browsing
- **Grid Layout**: Products displayed in responsive card layout
- **Search**: Real-time search across product names and descriptions
- **Sorting**: Sort by price (low to high, high to low) and name
- **Pagination**: Efficient loading with page navigation
- **Product Details**: Click any product to view detailed information

### 2. Shopping Cart
- **Add to Cart**: Quick add from product grid or detailed add from product page
- **Quantity Management**: Increase/decrease quantities with stock validation
- **Real-time Updates**: Cart count and totals update instantly
- **Persistent Cart**: Cart data persists across browser sessions
- **Cart Summary**: View subtotal, shipping, tax, and total calculations

### 3. User Authentication
- **Registration**: Create account with name, email, and password
- **Login**: Secure login with JWT token authentication
- **Password Security**: Passwords hashed with bcrypt
- **Profile Management**: Update user information and addresses
- **Session Management**: Automatic logout on token expiration

### 4. Checkout Process
- **Shipping Information**: Collect delivery address and contact details
- **Order Summary**: Review items, quantities, and pricing
- **Payment Method**: Select from available payment options
- **Order Confirmation**: Success page with order details
- **Stock Validation**: Ensure items are available before order placement

### 5. Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Large touch targets for mobile users
- **Fast Loading**: Optimized images and efficient code

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-restart
```

### Frontend Development
The frontend uses vanilla JavaScript with a modular architecture:
- **config.js**: Application configuration and utilities
- **api.js**: API service layer with error handling
- **auth.js**: Authentication logic and user management
- **cart.js**: Shopping cart functionality
- **products.js**: Product display and management
- **checkout.js**: Order processing workflow
- **app.js**: Main application initialization

### Database Schema

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: String,
  isAdmin: Boolean
}
```

#### Product Model
```javascript
{
  name: String,
  image: String,
  description: String,
  price: Number,
  countInStock: Number
}
```

#### Cart Model
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  totalItems: Number
}
```

#### Order Model
```javascript
{
  user: ObjectId (ref: User),
  orderItems: [{
    product: ObjectId (ref: Product),
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: String,
  itemsPrice: Number,
  shippingPrice: Number,
  taxPrice: Number,
  totalPrice: Number,
  status: String,
  isPaid: Boolean,
  isDelivered: Boolean
}
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is configured
3. Deploy the backend folder

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend (if using a build process)
2. Update API_BASE_URL in config.js to point to your deployed backend
3. Deploy the frontend-vanilla folder

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add/remove items from cart
- [ ] Update cart quantities
- [ ] Complete checkout process
- [ ] View order confirmation
- [ ] Responsive design on different devices
- [ ] Error handling and validation

### API Testing
Use tools like Postman or Thunder Client to test API endpoints:
1. Register a new user
2. Login and get JWT token
3. Test protected routes with Authorization header
4. Test cart operations
5. Test order creation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CodeAlpha** for the internship opportunity
- **MongoDB** for the excellent database solution
- **Express.js** for the robust backend framework
- **Font Awesome** for the beautiful icons
- **Google Fonts** for the typography
- **Unsplash** for the sample product images

## 📞 Support

If you have any questions or need help with the project:

1. Check the [Issues](https://github.com/yourusername/CodeAlpha_Ecommerce_Store/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about your environment and the issue

---

**Built with ❤️ for CodeAlpha Internship Program**