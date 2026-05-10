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

export default function CategoryPageContent({ id, categoryName, initialProducts, initialTotal, totalPages, currentPage, searchParams }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.sortBy || 'Most Popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update products when initialProducts change (from server)
  useEffect(() => {
    setProducts(initialProducts);
    setLoading(false);
    setIsFilterOpen(false); // Close filter on apply/navigation
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
      if (key === 'categoryId') {
        if (['on-sale', 'new-arrivals', 'top-selling'].includes(id)) {
           if (value) {
             params.append(key, value);
             hasFilters = true;
           }
        }
      } else if (value !== undefined && value !== null && value !== '') {
        if (key === 'minPrice' && parseInt(value) === 0) return;
        if (key === 'maxPrice' && parseInt(value) === 10000) return;

        params.append(key, value);
        hasFilters = true;
      }
    });

    if (sortBy !== 'Most Popular') {
      params.append('sortBy', sortBy);
      hasFilters = true;
    }

    // Reset to page 1 on filter apply
    params.delete('page');

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
    params.delete('page'); // Reset to page 1 on sort change
    router.push(`/category/${id}?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    router.push(`/category/${id}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          {/* Mobile Filter Overlay */}
          {isFilterOpen && <div className="mobile-filter-overlay" onClick={() => setIsFilterOpen(false)} />}
          
          <aside className={`category-sidebar ${isFilterOpen ? 'mobile-open' : ''}`}>
            <Sidebar 
              onApplyFilter={handleApplyFilter} 
              initialFilters={{ ...searchParams, categoryId: !['on-sale', 'new-arrivals', 'top-selling'].includes(id) ? id : searchParams.categoryId }}
              onClose={() => setIsFilterOpen(false)}
            />
          </aside>

          <main className="category-content">
            <header className="category-header">
              <div className="header-left">
                <h1>{categoryName}</h1>
                <p className="product-count">
                  {initialTotal > 0 ? `Showing ${(currentPage - 1) * 9 + 1}-${Math.min(currentPage * 9, initialTotal)} of ${initialTotal} Products` : 'No Products Available'}
                </p>
              </div>
              <div className="header-right">
                <button className="mobile-filter-trigger" onClick={() => setIsFilterOpen(true)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21M6 12H18M10 18H14" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
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
                {totalPages > 1 && (
                  <div className="pagination-wrapper">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
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
