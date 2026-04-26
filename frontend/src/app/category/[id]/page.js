'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import './category-page.css';

export default function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        let url = `http://localhost:5000/api/products?categoryId=${id}`;
        let title = 'Category';

        if (id === 'new-arrivals') {
          url = 'http://localhost:5000/api/products/new-arrivals';
          title = 'New Arrivals';
        } else if (id === 'top-selling') {
          url = 'http://localhost:5000/api/products/top-selling';
          title = 'Top Selling';
        } else if (id === 'on-sale') {
          url = 'http://localhost:5000/api/products?onSale=true';
          title = 'On Sale';
        }

        const res = await fetch(url);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
        
        if (id !== 'new-arrivals' && id !== 'top-selling' && id !== 'on-sale') {
          if (data.length > 0) {
            setCategoryName(data[0].Category?.name || 'Category');
          } else {
            setCategoryName('Category');
          }
        } else {
          setCategoryName(title);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryProducts();
    }
  }, [id]);

  return (
    <>
      <div className="container category-container">
        <h1 className="category-title">{categoryName.toUpperCase()}</h1>
        
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
            No products found in this collection.
          </div>
        )}
      </div>
    </>
  );
}
