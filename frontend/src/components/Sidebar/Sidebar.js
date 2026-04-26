'use client';

import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const [selectedColor, setSelectedColor] = useState('blue');
  const [selectedSize, setSelectedSize] = useState('Large');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const colors = [
    '#00C12B', '#F50606', '#F5DD06', '#F57906', '#06CAF5', 
    '#063AF5', '#7D06F5', '#F506A4', '#FFFFFF', '#000000'
  ];
  const sizes = [
    'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 
    'X-Large', 'XX-Large', '3X-Large', '4X-Large'
  ];
  const dressStyles = ['Casual', 'Formal', 'Party', 'Gym'];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filters</h3>
        <span className="filter-icon">⚙️</span>
      </div>

      <div className="filter-section">
        <ul className="category-list">
          {categories.map(cat => (
            <li key={cat.id}>{cat.name} <span>&gt;</span></li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <div className="section-header">
          <h3>Price</h3>
          <span>^</span>
        </div>
        <div className="price-slider">
          <div className="slider-track"></div>
          <div className="slider-handle left"></div>
          <div className="slider-handle right"></div>
          <div className="price-labels">
            <span>₹500</span>
            <span>₹20000</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="section-header">
          <h3>Colors</h3>
          <span>^</span>
        </div>
        <div className="color-grid">
          {colors.map((color, index) => (
            <div 
              key={index} 
              className={`color-item ${selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color, border: color === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
              onClick={() => setSelectedColor(color)}
            >
              {selectedColor === color && <span className="check">✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="section-header">
          <h3>Size</h3>
          <span>^</span>
        </div>
        <div className="size-grid">
          {sizes.map(size => (
            <button 
              key={size}
              className={`size-item ${selectedSize === size ? 'active' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="section-header">
          <h3>Dress Style</h3>
          <span>^</span>
        </div>
        <ul className="category-list">
          {dressStyles.map(style => (
            <li key={style}>{style} <span>&gt;</span></li>
          ))}
        </ul>
      </div>

      <button className="apply-filter-btn">Apply Filter</button>
    </aside>
  );
}
