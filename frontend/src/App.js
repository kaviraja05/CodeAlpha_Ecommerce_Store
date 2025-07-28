import React from 'react';
import './App.css';
import ProductList from './components/ProductList';

function App() {
  return (
    <div className="container">
      <h1>Welcome to the E-Commerce Store 🛍️</h1>
      <h2>🛒 Product List</h2>
      <ProductList />
    </div>
  );
}

export default App;
