'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Sidebar from '@/components/Sidebar/Sidebar';
import Pagination from '@/components/Pagination/Pagination';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import './shop-page.css';

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('Most Popular');

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilters = {};
    
    if (params.get('categoryId')) newFilters.categoryId = params.get('categoryId');
    if (params.get('color')) newFilters.color = params.get('color');
    if (params.get('size')) newFilters.size = params.get('size');
    if (params.get('style')) newFilters.style = params.get('style');
    if (params.get('minPrice')) newFilters.minPrice = params.get('minPrice');
    if (params.get('maxPrice')) newFilters.maxPrice = params.get('maxPrice');
    if (params.get('search')) newFilters.search = params.get('search');
    if (params.get('brand')) newFilters.brand = params.get('brand');
    
    setFilters(newFilters);
  }, [searchParams]);

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      try {
        let endpoint = 'http://localhost:5000/api/products';
        const params = new URLSearchParams();
        if (filters.categoryId) params.append('categoryId', filters.categoryId);

        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
        if (filters.color) params.append('color', filters.color);
        if (filters.style) params.append('style', filters.style);
        if (filters.size) params.append('size', filters.size);
        if (filters.search) params.append('search', filters.search);
        if (filters.brand) params.append('brand', filters.brand);
        
        const sortMap = {
          'Most Popular': 'rating',
          'Newest': 'newest',
          'Price: Low to High': 'price-asc',
          'Price: High to Low': 'price-desc'
        };
        params.append('sortBy', sortMap[sortBy] || 'newest');

        const prodRes = await fetch(`${endpoint}?${params.toString()}`, { cache: 'no-store' });
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [filters, sortBy]);

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '#' },
  ];

  return (
    <div className="shop-page">
      <div className="container">
        <Breadcrumbs paths={breadcrumbPaths} />

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <Sidebar onApplyFilter={handleApplyFilter} />
          </aside>

          <main className="shop-content">
            <header className="shop-header">
              <div className="header-left">
                <h1>ALL PRODUCTS</h1>
                <p className="product-count">
                  {products.length > 0 ? `Showing 1-${products.length} of ${products.length} Products` : 'No Products Available'}
                </p>
              </div>
              <div className="header-right">
                <span className="sort-label">Sort by:</span>
                <div className="shop-sort-wrapper">
                  <CustomSelect
                    options={['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low']}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    placeholder="Most Popular"
                  />
                </div>
              </div>
            </header>

            {loading ? (
              <div className="loading-state">LOADING PRODUCTS...</div>
            ) : products.length > 0 ? (
              <>
                <div className="shop-products-grid">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 4}
                      activeColors={searchParams.get('color')}
                    />
                  ))}
                </div>
                <div className="pagination-wrapper">
                  <Pagination />
                </div>
              </>
            ) : (
              <div className="no-results">
                <div className="no-results-content">
                  <h3>No products found matching your search criteria.</h3>
                  <p>Try adjusting your search or filters to find what you're looking for.</p>
                  <button onClick={resetFilters} className="clear-filters-btn">
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
