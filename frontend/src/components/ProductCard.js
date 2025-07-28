import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">₹{product.price}</p>
      <p>{product.description}</p>
      <p className="stock">Stock: {product.countInStock}</p>
    </div>
  );
};

export default ProductCard;
