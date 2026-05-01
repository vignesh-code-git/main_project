'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Sidebar from '@/components/Sidebar/Sidebar';
import Pagination from '@/components/Pagination/Pagination';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import './category-page.css';

export default function CategoryPageContent({ id, categoryName, initialProducts, initialTotal, searchParams }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.sortBy || 'Most Popular');

  // Update products when initialProducts change (from server)
  useEffect(() => {
    setProducts(initialProducts);
    setLoading(false);
  }, [initialProducts]);

  const handleApplyFilter = (newFilters) => {
    const params = new URLSearchParams();
    
    // Determine the base path
    let basePath = `/category/${id}`;
    
    // If it's a real category ID being changed, navigate to the new path
    if (!['on-sale', 'new-arrivals', 'top-selling'].includes(id) && 
        newFilters.categoryId && newFilters.categoryId.toString() !== id.toString()) {
      basePath = `/category/${newFilters.categoryId}`;
    }

    let hasFilters = false;
    Object.entries(newFilters).forEach(([key, value]) => {
      // Don't append categoryId if it's already in the path or we are on a special page where it will be handled as a query param
      if (key === 'categoryId') {
        if (['on-sale', 'new-arrivals', 'top-selling'].includes(id)) {
           if (value) {
             params.append(key, value);
             hasFilters = true;
           }
        }
      } else if (value !== undefined && value !== null && value !== '') {
        // For price, only append if it deviates from the 0-500 range
        if (key === 'minPrice' && parseInt(value) === 0) return;
        if (key === 'maxPrice' && parseInt(value) === 500) return;

        params.append(key, value);
        hasFilters = true;
      }
    });

    if (sortBy !== 'Most Popular') {
      params.append('sortBy', sortBy);
      hasFilters = true;
    }

    const currentQuery = window.location.search;
    if (hasFilters || currentQuery) {
      setLoading(true);
      router.push(`${basePath}${hasFilters ? '?' + params.toString() : ''}`);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    params.set('sortBy', newSort);
    router.push(`/category/${id}?${params.toString()}`);
  };

  const resetFilters = () => {
    setLoading(true);
    router.push(`/category/${id}`);
  };

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: categoryName || 'Category', url: '#' },
  ];

  return (
    <div className="category-page">
      <div className="container">
        <Breadcrumbs paths={breadcrumbPaths} />

        <div className="category-layout">
          <aside className="category-sidebar">
            <Sidebar 
              onApplyFilter={handleApplyFilter} 
              initialFilters={{ ...searchParams, categoryId: !['on-sale', 'new-arrivals', 'top-selling'].includes(id) ? id : searchParams.categoryId }} 
            />
          </aside>

          <main className="category-content">
            <header className="category-header">
              <div className="header-left">
                <h1>{categoryName}</h1>
                <p className="product-count">
                  {initialTotal > 0 ? `Showing 1-${products.length} of ${initialTotal} Products` : 'No Products Available'}
                </p>
              </div>
              <div className="header-right">
                <span className="sort-label">Sort by:</span>
                <div className="category-sort-wrapper">
                  <CustomSelect
                    options={['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low']}
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    placeholder="Most Popular"
                  />
                </div>
              </div>
            </header>

            {loading ? (
              <div className="category-products-grid">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="category-products-grid">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 4}
                      activeColors={searchParams.color}
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
