'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Sidebar from '@/components/Sidebar/Sidebar';
import Pagination from '@/components/Pagination/Pagination';
import CustomSelect from '@/components/CustomSelect/CustomSelect';
import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import './shop-page.css';

export default function ShopPageContent({ initialProducts, initialTotal, searchParams }) {
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
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    params.append('sortBy', sortBy);
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    params.set('sortBy', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  const resetFilters = () => {
    setLoading(true);
    router.push('/shop');
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
            <Sidebar onApplyFilter={handleApplyFilter} initialFilters={searchParams} />
          </aside>

          <main className="shop-content">
            <header className="shop-header">
              <div className="header-left">
                <h1>ALL PRODUCTS</h1>
                <p className="product-count">
                  {products.length > 0 ? `Showing 1-${products.length} of ${initialTotal} Products` : 'No Products Available'}
                </p>
              </div>
              <div className="header-right">
                <span className="sort-label">Sort by:</span>
                <div className="shop-sort-wrapper">
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
              <div className="shop-products-grid">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="shop-products-grid">
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
