'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ onApplyFilter }) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 500, max: 20000 });
  const [selectedStyle, setSelectedStyle] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const colors = [
    { name: 'Olive', value: '#4F4F31' },
    { name: 'Navy', value: '#1A237E' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Gray', value: '#808080' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' }
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
        <SlidersHorizontal size={20} className="filter-icon" />
      </div>

      <div className="filter-section category-links">
        <ul className="category-list">
          {[
            { display: 'T-shirts', query: 'T-shirt' },
            { display: 'Shorts', query: 'Short' },
            { display: 'Shirts', query: 'Shirt' },
            { display: 'Hoodie', query: 'Hoodie' },
            { display: 'Jeans', query: 'Jean' }
          ].map(cat => (
            <li
              key={cat.display}
              onClick={() => {
                onApplyFilter({ style: cat.query });
              }}
            >
              {cat.display} <ChevronRight size={16} />
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <div className="section-header">
          <h3>Price</h3>
          <span>^</span>
        </div>
        <div className="price-slider">
          <div
            className="range-input-container"
            style={{
              background: `linear-gradient(to right, #F0F0F0 ${(priceRange.min / 30000) * 100}%, #000 ${(priceRange.min / 30000) * 100}%, #000 ${(priceRange.max / 30000) * 100}%, #F0F0F0 ${(priceRange.max / 30000) * 100}%)`
            }}
          >
            <input
              type="range"
              min="0"
              max="30000"
              step="500"
              value={priceRange.min}
              onChange={(e) => {
                const val = Math.min(Math.round(parseInt(e.target.value) / 500) * 500, priceRange.max - 500);
                setPriceRange(prev => ({ ...prev, min: val }));
              }}
              className="range-min"
            />
            <input
              type="range"
              min="0"
              max="30000"
              step="500"
              value={priceRange.max}
              onChange={(e) => {
                const val = Math.max(Math.round(parseInt(e.target.value) / 500) * 500, priceRange.min + 500);
                setPriceRange(prev => ({ ...prev, max: val }));
              }}
              className="range-max"
            />
          </div>
          <div className="price-labels">
            <span>₹{priceRange.min}</span>
            <span>₹{priceRange.max}</span>
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
              className={`color-item ${selectedColor === color.name ? 'active' : ''}`}
              style={{ backgroundColor: color.value, border: color.name === 'White' ? '1px solid #ddd' : 'none' }}
              onClick={() => setSelectedColor(prev => prev === color.name ? '' : color.name)}
            >
              {selectedColor === color.name && <span className="check">✓</span>}
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
              onClick={() => setSelectedSize(prev => prev === size ? '' : size)}
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
            <li
              key={style}
              className={selectedStyle === style ? 'active-style' : ''}
              onClick={() => setSelectedStyle(prev => prev === style ? '' : style)}
            >
              {style} <span>&gt;</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="apply-filter-btn"
        onClick={() => onApplyFilter({
          color: selectedColor,
          size: selectedSize,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          style: selectedStyle
        })}
      >
        Apply Filter
      </button>
    </aside>
  );
}
