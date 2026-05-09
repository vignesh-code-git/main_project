'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { addItemToCart, fetchCart } from '@/lib/redux/slices/cartSlice';
import { useSelector } from 'react-redux';
import './ProductCard.css';

export default function ProductCard({ product, priority = false, activeColors = null }) {
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { API_BASE_URL, resolveImageUrl } = require('@/config/api');

  // Find the first image that matches the filtered colors
  const getDisplayImage = () => {
    let rawUrl = '';
    if (!activeColors || !product.images) {
      rawUrl = product.images?.[0]?.url || product.imageUrl;
    } else {
      const selectedColors = activeColors.split(',').map(c => c.trim().toLowerCase());
      const matchingImage = product.images.find(img =>
        img.color && typeof img.color === 'string' && selectedColors.includes(img.color.toLowerCase())
      );
      rawUrl = (matchingImage?.url) || product.imageUrl || (product.images?.[0]?.url);
    }

    return resolveImageUrl(rawUrl);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    try {
      await dispatch(addItemToCart({
        productId: product.id,
        quantity: 1,
        size: product.size ? product.size.split(',')[0].trim() : 'Medium',
        color: product.color ? product.color.split(',')[0].trim() : 'White'
      })).unwrap();
      dispatch(fetchCart());
    } catch (err) {
      console.error('Quick add failed:', err);
    }
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
              <span className="discount-badge">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
