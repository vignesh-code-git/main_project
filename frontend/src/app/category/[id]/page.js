'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Sidebar from '@/components/Sidebar/Sidebar';
import Pagination from '@/components/Pagination/Pagination';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import './category-page.css';

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('Most Popular');

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ categoryId: id });
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
        if (filters.color) params.append('color', filters.color);
        if (filters.style) params.append('style', filters.style);

        console.log("Fetching products with params:", params.toString());
        const prodRes = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
        const prodData = await prodRes.json();
        setProducts(prodData);

        // Fetch category details
        const catRes = await fetch(`http://localhost:5000/api/products/categories`);
        const catData = await catRes.json();
        const currentCat = catData.find(c => c.id === parseInt(id));
        setCategory(currentCat);
      } catch (err) {
        console.error("Failed to fetch category data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [id, filters]);

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
                  Showing 1-{products.length} of {products.length} Products
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
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="pagination-wrapper">
                  <Pagination />
                </div>
              </>
            ) : (
              <div className="no-results">
                <p>No products found matching your search criteria.</p>
                <button onClick={resetFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
