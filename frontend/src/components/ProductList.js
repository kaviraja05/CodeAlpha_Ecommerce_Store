import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch data from backend
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>🛒 Product List</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              width: "200px",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
            <p>{product.description}</p>
            <p><strong>Stock:</strong> {product.countInStock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;

