'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { addItem } from '@/lib/redux/slices/cartSlice';
import './ProductCard.css';

export default function ProductCard({ product, priority = false, activeColors = null }) {
  const dispatch = useDispatch();

  // Find the first image that matches the filtered colors
  const getDisplayImage = () => {
    if (!activeColors || !product.images) return product.images?.[0]?.url;

    const selectedColors = activeColors.split(',').map(c => c.trim().toLowerCase());
    const matchingImage = product.images.find(img => 
      img.color && typeof img.color === 'string' && selectedColors.includes(img.color.toLowerCase())
    );

    const fallback = product.imageUrl || (product.images?.[0]?.url) || '/images/placeholder.png';
    return (matchingImage?.url) || fallback;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem(product));
  };

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <Image 
            src={getDisplayImage()} 
            alt={product.name} 
            className="real-product-img" 
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="img-placeholder"></div>
        )}
        <button className="quick-add-btn" onClick={handleAddToCart}>+</button>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        
        {/* Color Swatches */}
        {product.color && (
          <div className="product-card-colors">
            {product.color.split(',').map((c, i) => {
              const colorName = c.trim();
              const isSelected = activeColors?.toLowerCase().includes(colorName.toLowerCase());
              return (
                <span 
                  key={i} 
                  className={`card-color-dot ${isSelected ? 'selected' : ''}`}
                  title={colorName}
                  style={{ 
                    backgroundColor: colorName.toLowerCase(),
                    border: colorName.toLowerCase() === 'white' ? '1px solid #ddd' : 'none'
                  }}
                ></span>
              );
            })}
          </div>
        )}

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
