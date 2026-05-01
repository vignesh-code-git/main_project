'use client';

import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import './Sidebar.css';

export default function Sidebar({ onApplyFilter, initialFilters = {} }) {
  const [selectedColor, setSelectedColor] = useState(initialFilters.color || '');
  const [selectedSize, setSelectedSize] = useState(initialFilters.size || '');
  const [priceRange, setPriceRange] = useState({ 
    min: parseInt(initialFilters.minPrice) || 0, 
    max: parseInt(initialFilters.maxPrice) || 10000 
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialFilters.categoryId || '');
  const [selectedStyle, setSelectedStyle] = useState(initialFilters.style || '');
  const [categories, setCategories] = useState([]);
  const isFirstRender = useRef(true);
  
  // Accordion states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorsOpen, setIsColorsOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/categories`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Instant update: trigger filter when any state changes (skipping first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (onApplyFilter) {
      onApplyFilter({
        categoryId: selectedCategoryId,
        color: selectedColor,
        size: selectedSize,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        style: selectedStyle
      });
    }
  }, [selectedColor, selectedSize, priceRange, selectedCategoryId, selectedStyle]);
  
  const clearFilters = () => {
    setSelectedColor('');
    setSelectedSize('');
    setPriceRange({ min: 0, max: 10000 });
    setSelectedStyle('');
    setSelectedCategoryId('');
    onApplyFilter({});
  };

  const colors = [
    { name: 'Green', value: '#00C12B' },
    { name: 'Red', value: '#F50606' },
    { name: 'Yellow', value: '#F5DD06' },
    { name: 'Orange', value: '#F57906' },
    { name: 'Cyan', value: '#06CAF5' },
    { name: 'Blue', value: '#063AF5' },
    { name: 'Purple', value: '#7D06F5' },
    { name: 'Pink', value: '#F506A4' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Olive', value: '#4F4F31' },
    { name: 'Navy', value: '#1A237E' },
    { name: 'Gray', value: '#808080' }
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
        <button className="clear-all-btn" onClick={clearFilters}>Clear All</button>
        <SlidersHorizontal size={24} className="filter-icon" />
      </div>

      <div className="filter-section category-links">
        <ul className="category-list">
          {['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'].map(cat => (
            <li
              key={cat}
              className={selectedCategoryId === categories.find(c => c.name.toLowerCase().includes(cat.toLowerCase().replace('s', '')))?.id ? 'active-category' : ''}
              onClick={() => {
                const category = categories.find(c => c.name.toLowerCase().includes(cat.toLowerCase().replace('s', '')));
                const newCatId = category ? category.id : '';
                setSelectedCategoryId(newCatId);
              }}
            >
              {cat} <ChevronRight size={16} />
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-section">
        <div className="section-header" onClick={() => setIsPriceOpen(!isPriceOpen)}>
          <h3>Price</h3>
          {isPriceOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {isPriceOpen && (
          <div className="price-slider">
            <div
              className="range-input-container"
              style={{
                background: `linear-gradient(to right, #F0F0F0 ${(priceRange.min / 10000) * 100}%, #000 ${(priceRange.min / 10000) * 100}%, #000 ${(priceRange.max / 10000) * 100}%, #F0F0F0 ${(priceRange.max / 10000) * 100}%)`
              }}
            >
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange.min}
                onChange={(e) => {
                  const val = Math.min(parseInt(e.target.value), priceRange.max - 100);
                  setPriceRange(prev => ({ ...prev, min: val }));
                }}
                className="range-min"
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange.max}
                onChange={(e) => {
                  const val = Math.max(parseInt(e.target.value), priceRange.min + 100);
                  setPriceRange(prev => ({ ...prev, max: val }));
                }}
                className="range-max"
              />
            </div>
            <div className="price-labels">
              <span className="price-label">₹{priceRange.min}</span>
              <span className="price-label">₹{priceRange.max}</span>
            </div>
          </div>
        )}
      </div>

      <div className="filter-section">
        <div className="section-header" onClick={() => setIsColorsOpen(!isColorsOpen)}>
          <h3>Colors</h3>
          {isColorsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {isColorsOpen && (
          <div className="color-grid figma-colors">
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
        )}
      </div>

      <div className="filter-section">
        <div className="section-header" onClick={() => setIsSizeOpen(!isSizeOpen)}>
          <h3>Size</h3>
          {isSizeOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {isSizeOpen && (
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
        )}
      </div>

      <div className="filter-section">
        <div className="section-header" onClick={() => setIsStyleOpen(!isStyleOpen)}>
          <h3>Dress Style</h3>
          {isStyleOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        {isStyleOpen && (
          <ul className="category-list">
            {dressStyles.map(style => (
              <li
                key={style}
                className={selectedStyle === style ? 'active-style' : ''}
                onClick={() => setSelectedStyle(prev => prev === style ? '' : style)}
              >
                {style} <ChevronRight size={16} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="apply-filter-btn"
        onClick={() => onApplyFilter({
          categoryId: selectedCategoryId,
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
