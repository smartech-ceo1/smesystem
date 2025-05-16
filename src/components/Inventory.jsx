import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
        setProducts(response.data);
        setFilteredProducts(response.data);
        const uniqueCategories = [...new Set(response.data.map(p => p.category))];
        setCategories(uniqueCategories);
        const initialQuantities = {};
        response.data.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const updateQuantity = (productId, change) => {
    setQuantities(prev => {
      const product = products.find(p => p.id === productId);
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(1, Math.min(product.quantity, currentQuantity + change));
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddToCart = (product) => {
    const selectedQuantity = quantities[product.id] || 1;
    if (selectedQuantity > product.quantity) {
      alert(`Cannot add ${selectedQuantity} items. Only ${product.quantity} available.`);
      return;
    }
    addToCart(product, selectedQuantity);
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const handleRate = async (productId, rating) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/products/${productId}/rate`, { rating });
      setProducts(products.map(product =>
        product.id === productId ? { ...product, rating } : product
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="module">
      <h2>Products</h2>
      <div className="inventory-controls">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-item">
            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} />
            <h3>{product.name}</h3>
            <p>Quantity: {product.quantity}</p>
            <p>Price: KSh {product.price.toFixed(2)}</p>
            <p>Category: {product.category}</p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={star <= product.rating ? 'fas fa-star' : 'far fa-star'}
                  onClick={() => handleRate(product.id, star)}
                ></span>
              ))}
            </div>
            <div className="quantity-selector">
              <button onClick={() => updateQuantity(product.id, -1)}>
                <i className="fas fa-minus"></i>
              </button>
              <input
                type="number"
                value={quantities[product.id] || 1}
                min="1"
                max={product.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setQuantities({
                    ...quantities,
                    [product.id]: Math.max(1, Math.min(product.quantity, value))
                  });
                }}
              />
              <button onClick={() => updateQuantity(product.id, 1)}>
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <p>Selected: {quantities[product.id] || 1}, Total: KSh {(product.price * (quantities[product.id] || 1)).toFixed(2)}</p>
            <button onClick={() => handleAddToCart(product)} className="add-to-cart">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;