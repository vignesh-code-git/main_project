'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import './shop-page.css';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch all products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '#' },
  ];

  return (
    <div className="shop-page">
      <Breadcrumbs paths={breadcrumbPaths} />
      <div className="container">
        <header className="shop-header">
          <h1>ALL PRODUCTS</h1>
          <p>Showing {products.length} items</p>
        </header>

        {loading ? (
          <div className="loading" style={{ padding: '80px', textAlign: 'center', fontWeight: '800' }}>LOADING COLLECTION...</div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="no-products" style={{ padding: '80px', textAlign: 'center', color: '#666' }}>
            No products found in the store.
          </div>
        )}
      </div>
    </div>
  );
}
