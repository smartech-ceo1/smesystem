import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, refreshKey }) => {
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get('category');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from public API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // Optional: Include JWT token if user is logged in
        const token = localStorage.getItem('token'); // Adjust based on your auth setup
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/public/categories`, {
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sidebar categories received:', data);

        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Invalid categories data:', data);
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [refreshKey]);

  return (
    <div className={`sidebar ${isOpen ? '' : 'hidden'}`}>
      <div className="sidebar-header">
        <span>To Find Categories Scroll Up/Down</span>
      </div>
      <nav className="category-nav">
        {loading ? (
          <p>Loading categories...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : categories.length === 0 ? (
          <p>No categories available</p>
        ) : (
          categories.map(category => (
            <Link
              key={category.id}
              to={`/?category=${encodeURIComponent(category.name)}`}
              className={`category-link ${currentCategory === category.name ? 'active-category' : ''}`}
            >
              {category.name}
            </Link>
          ))
        )}
      </nav>
    </div>
  );
};

export default Sidebar;