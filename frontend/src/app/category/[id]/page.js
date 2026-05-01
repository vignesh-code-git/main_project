'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Sidebar from '@/components/Sidebar/Sidebar';
import Pagination from '@/components/Pagination/Pagination';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import { API_BASE_URL } from '@/config/api';
import './category-page.css';

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('Most Popular');

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        let endpoint = `${API_BASE_URL}/api/products`;
        const params = new URLSearchParams();
        const styles = ['casual', 'formal', 'party', 'gym'];

        if (id === 'new-arrivals') {
          endpoint = `${API_BASE_URL}/api/products/new-arrivals`;
          setCategory({ name: 'New Arrivals' });
        } else if (id === 'top-selling') {
          endpoint = `${API_BASE_URL}/api/products/top-selling`;
          setCategory({ name: 'Top Selling' });
        } else if (id === 'on-sale') {
          params.append('onSale', 'true');
          setCategory({ name: 'On Sale' });
        } else if (styles.includes(id.toLowerCase())) {
          params.append('style', id.charAt(0).toUpperCase() + id.slice(1));
          setCategory({ name: id.charAt(0).toUpperCase() + id.slice(1) });
        } else {
          params.append('categoryId', id);
          // Fetch category details
          const catRes = await fetch(`${API_BASE_URL}/api/products/categories`);
          const catData = await catRes.json();
          const currentCat = catData.find(c => c.id === parseInt(id));
          setCategory(currentCat);
        }

        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
        if (filters.color) params.append('color', filters.color);
        if (filters.style) params.append('style', filters.style);
        if (filters.size) params.append('size', filters.size);
        if (filters.search) params.append('search', filters.search);
        
        const sortMap = {
          'Most Popular': 'rating',
          'Newest': 'newest',
          'Price: Low to High': 'price-asc',
          'Price: High to Low': 'price-desc'
        };
        params.append('sortBy', sortMap[sortBy] || 'newest');

        const prodRes = await fetch(`${endpoint}?${params.toString()}`);
        const prodData = await prodRes.json();
        
        if (prodData.products) {
          setProducts(prodData.products);
          setTotal(prodData.total || prodData.products.length);
        } else {
          setProducts(Array.isArray(prodData) ? prodData : []);
          setTotal(Array.isArray(prodData) ? prodData.length : 0);
        }
      } catch (err) {
        console.error("Failed to fetch category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id, filters, sortBy]);

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
  };

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: category?.name || 'Category', url: '#' },
  ];

  return (
    <div className="category-page">
      <div className="container">
        <Breadcrumbs paths={breadcrumbPaths} />

        <div className="category-layout">
          <aside className="category-sidebar">
            <Sidebar onApplyFilter={handleApplyFilter} />
          </aside>

          <main className="category-content">
            <header className="category-header">
              <div className="header-left">
                <h1>{category?.name || 'Loading...'}</h1>
                <p className="product-count">
                  {total > 0 ? `Showing 1-${products.length} of ${total} Products` : 'No Products Available'}
                </p>
              </div>
              <div className="header-right">
                <span className="sort-label">Sort by:</span>
                <div className="category-sort-wrapper">
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
                <div className="category-products-grid">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 4}
                      activeColors={filters.color}
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
