'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/redux/slices/cartSlice';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem(product));
  };

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].url} 
            alt={product.name} 
            className="real-product-img" 
          />
        ) : (
          <div className="img-placeholder"></div>
        )}
        <button className="quick-add-btn" onClick={handleAddToCart}>+</button>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-rating">
          <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
          <span className="rating-value">{product.rating}/5</span>
        </div>
        <div className="product-price">
          <span className="current-price">₹{product.price}</span>
          {product.originalPrice && (
            <>
              <span className="original-price">₹{product.originalPrice}</span>
              <span className="discount-badge">-{Math.round((1 - product.price/product.originalPrice) * 100)}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
