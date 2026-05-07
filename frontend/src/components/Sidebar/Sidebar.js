'use client';

import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp, Check } from 'lucide-react';
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
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [styles, setStyles] = useState([]);
  
  const isFirstRender = useRef(true);
  
  // Accordion states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorsOpen, setIsColorsOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);

  useEffect(() => {
    // Fetch all filters from database
    const fetchFilters = async () => {
      try {
        const [catRes, colorRes, sizeRes, styleRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products/categories`),
          fetch(`${API_BASE_URL}/api/products/colors`),
          fetch(`${API_BASE_URL}/api/products/sizes`),
          fetch(`${API_BASE_URL}/api/products/styles`)
        ]);

        const [catData, colorData, sizeData, styleData] = await Promise.all([
          catRes.json(),
          colorRes.json(),
          sizeRes.json(),
          styleRes.json()
        ]);

        setCategories(catData);
        setColors(colorData);
        setSizes(sizeData);
        setStyles(styleData);
      } catch (err) {
        console.error('Error fetching sidebar filters:', err);
      }
    };

    fetchFilters();
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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filters</h3>
        <button className="clear-all-btn" onClick={clearFilters}>Clear All</button>
        <SlidersHorizontal size={24} className="filter-icon" />
      </div>

      <div className="filter-section category-links">
        <ul className="category-list">
          {categories.length > 0 ? (
            categories.map(cat => (
              <li
                key={cat.id}
                className={selectedCategoryId === cat.id ? 'active-category' : ''}
                onClick={() => setSelectedCategoryId(prev => prev === cat.id ? '' : cat.id)}
              >
                {cat.name} <ChevronRight size={16} />
              </li>
            ))
          ) : (
            <li className="loading-text">Loading categories...</li>
          )}
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
            {colors.length > 0 ? (
              colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-item ${selectedColor === color.name ? 'active' : ''}`}
                  style={{ backgroundColor: color.hexCode || color.name.toLowerCase(), border: color.name?.toLowerCase() === 'white' ? '1px solid #ddd' : 'none' }}
                  onClick={() => setSelectedColor(prev => prev === color.name ? '' : color.name)}
                  title={color.name}
                >
                  {selectedColor === color.name && <Check size={16} strokeWidth={3} />}
                </div>
              ))
            ) : (
               <p className="loading-text">Loading colors...</p>
            )}
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
            {sizes.length > 0 ? (
              sizes.map(size => (
                <button
                  key={size.id}
                  className={`size-item ${selectedSize === size.name ? 'active' : ''}`}
                  onClick={() => setSelectedSize(prev => prev === size.name ? '' : size.name)}
                >
                  {size.name}
                </button>
              ))
            ) : (
              <p className="loading-text">Loading sizes...</p>
            )}
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
            {styles.length > 0 ? (
              styles.map(style => (
                <li
                  key={style.id}
                  className={selectedStyle === style.name ? 'active-style' : ''}
                  onClick={() => setSelectedStyle(prev => prev === style.name ? '' : style.name)}
                >
                  {style.name} <ChevronRight size={16} />
                </li>
              ))
            ) : (
              <li className="loading-text">Loading styles...</li>
            )}
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
