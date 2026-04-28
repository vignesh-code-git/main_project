'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Skeleton from '@/components/Skeleton/Skeleton';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import './shop-page.css';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        let url = new URL('http://localhost:5000/api/products');
        if (search) url.searchParams.append('search', search);
        if (minPrice) url.searchParams.append('minPrice', minPrice);
        if (maxPrice) url.searchParams.append('maxPrice', maxPrice);
        if (selectedCategory) url.searchParams.append('categoryId', selectedCategory);
        if (selectedStyle) url.searchParams.append('style', selectedStyle);
        if (selectedColor) url.searchParams.append('color', selectedColor);

        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 500); // Debounce search/filters

    return () => clearTimeout(timer);
  }, [search, minPrice, maxPrice, selectedCategory, selectedStyle, selectedColor]);

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '#' },
  ];

  return (
    <div className="shop-page">
      <Breadcrumbs paths={breadcrumbPaths} />
      
      <button 
        className="mobile-filter-trigger" 
        onClick={() => setShowMobileFilters(true)}
      >
        Filters <SlidersHorizontal size={18} />
      </button>

      <div className="container shop-layout">
        <aside className={`shop-sidebar ${showMobileFilters ? 'mobile-visible' : ''}`}>
          <div className="filter-group">
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="mobile-close-filters" onClick={() => setShowMobileFilters(false)}>
                <X size={20} />
              </button>
              <SlidersHorizontal size={20} className="desktop-only" />
            </div>
            
            <div className="filter-section">
              <h4>Categories</h4>
              <ul className="category-list">
                <li 
                  className={selectedCategory === '' ? 'active' : ''} 
                  onClick={() => setSelectedCategory('')}
                >
                  All Products <ChevronRight size={16} />
                </li>
                {categories.map(cat => (
                  <li 
                    key={cat.id}
                    className={selectedCategory === cat.id ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name} <ChevronRight size={16} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <span>₹{minPrice}</span>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))} 
                />
                <span>₹{maxPrice}</span>
              </div>
            </div>

            <div className="filter-section">
              <h4>Style</h4>
              <div className="tag-filters">
                {['Casual', 'Formal', 'Party', 'Gym'].map(style => (
                  <button 
                    key={style}
                    className={selectedStyle === style ? 'active' : ''}
                    onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="shop-content">
          <header className="shop-header">
            <div>
              <h1>ALL PRODUCTS</h1>
              <p>Showing {products.length} items</p>
            </div>
            <div className="shop-search">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </header>

          {loading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <Skeleton height="300px" borderRadius="20px" />
                  <Skeleton width="60%" height="20px" className="mt-4" />
                  <Skeleton width="40%" height="15px" className="mt-2" />
                  <Skeleton width="30%" height="25px" className="mt-2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <h3>No products found.</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={() => {
                setSearch('');
                setMinPrice(0);
                setMaxPrice(10000);
                setSelectedCategory('');
                setSelectedStyle('');
                setSelectedColor('');
              }} className="clear-btn">Clear All Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
