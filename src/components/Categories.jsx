import React from 'react';
import { Link } from 'react-router-dom';

const Categories = () => {
  const categories = [
    'Bags and Backpacks', 'Bike Accessories', 'Bluetooth Speakers', 'Brand New Cars',
    'Camera', 'Camping Gears', 'Car Accessories', 'Chargers and Cables', 'Chocolates',
    'Coffee and Tea', 'Cookware', 'Dishes', 'Drones', 'Facial Tools', 'Fitness Gears',
    'Fragrances', 'Furniture', 'Garage Solutions', 'GPS Devices', 'Hard Drive & SSD',
    'Headphones & Earbuds', 'Healthy Drinks', 'Jewelry', 'Kids Clothes',
    'Kitchen Appliances', 'Laptop Chargers', 'Laptop Keyboards', 'Laptop Stands',
    'Laptop and PC', 'Makeups', 'Men Clothes', 'Men Shoes', 'Mouse', 'Nail Care'
  ];

  return (
    <div className="module">
      <h2>Categories</h2>
      <ul className="category-list">
        {categories.map(category => (
          <li key={category}>
            <Link to={`/products?category=${encodeURIComponent(category)}`}>{category}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;