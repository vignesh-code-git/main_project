'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addItemToCart, fetchCart } from '@/lib/redux/slices/cartSlice';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import RazorpayDemo from '../Payment/RazorpayDemo';
import './ProductInfo.css';

export default function ProductInfo({ product, selectedColor, setSelectedColor }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const colorMap = {
    'green': '#00C12B',
    'red': '#F50606',
    'yellow': '#F5DD06',
    'orange': '#F57906',
    'cyan': '#06CAF5',
    'blue': '#063AF5',
    'purple': '#7D06F5',
    'pink': '#F506A4',
    'white': '#FFFFFF',
    'black': '#000000',
    'olive': '#4F4F31',
    'navy': '#1A237E',
    'gray': '#808080'
  };

  const productColors = product.color ? product.color.split(',').map(c => c.trim()) : [];


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      await dispatch(addItemToCart({
        productId: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor
      })).unwrap();
      
      // Refresh cart to get the latest state
      dispatch(fetchCart());
      
      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please log in to proceed with purchase.');
      router.push('/auth/login');
      return;
    }
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (method) => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        totalAmount: product.price * quantity,
        shippingAddress: '123 High Street, Downtown, Mumbai',
        zipcode: '400001',
        paymentMethod: method,
        items: [{
          id: product.id,
          quantity: quantity,
          price: product.price,
          size: selectedSize,
          color: selectedColor
        }]
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      if (res.ok) {
        router.push('/profile');
      } else {
        throw new Error('Failed to complete purchase after payment');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-info-detail">
      <h1 className="product-title">{product.name}</h1>
      <div className="product-rating">
        <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
        <span className="rating-text">{product.rating}/5</span>
      </div>
      <div className="product-price">
        <span className="current-price">₹{product.price}</span>
        {product.originalPrice && (
          <>
            <span className="original-price">₹{product.originalPrice}</span>
            <span className="discount-tag">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
          </>
        )}
        {product.isFreeDelivery && (
          <span className="free-delivery-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Free Delivery
          </span>
        )}
        <span className="delivery-time-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {product.deliveryDays || '3-5 Days'}
        </span>
      </div>
      <p className="product-description">{product.description}</p>

      <div className="product-meta-info">
        <div className="meta-grid">
          <div className="meta-row">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{product.Category?.name || 'N/A'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Brand:</span>
            <span className="meta-value">{product.brand || 'N/A'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Dress Style:</span>
            <span className="meta-value">{product.style || 'N/A'}</span>
          </div>
          <div className="meta-row stock">
            <span className="meta-label">Stock:</span>
            <span className={`meta-value ${product.stock < 5 ? 'low-stock' : ''}`}>
              {product.stock > 0 ? product.stock : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>

      <div className="selection-group">
        <h4>Select Colors</h4>
        <div className="color-swatches">
          {productColors.length > 0 ? (
            productColors.map(colorName => (
              <div
                key={colorName}
                className={`color-swatch ${selectedColor === colorName ? 'active' : ''}`}
                style={{ backgroundColor: colorMap[colorName.toLowerCase()] || colorName }}
                onClick={() => setSelectedColor(colorName)}
              >
                {selectedColor === colorName && <span className="check">✓</span>}
              </div>
            ))
          ) : (
            <p>No colors specified</p>
          )}
        </div>
      </div>

      <div className="selection-group">
        <h4>Choose Size</h4>
        <div className="size-buttons">
          {sizes.length > 0 ? (
            sizes.map(size => (
              <button
                key={size}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))
          ) : (
            <p className="no-data">No sizes specified for this product.</p>
          )}
        </div>
      </div>

      <div className="actions-group-container sticky-actions">
        <div className="all-actions-row">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <div className="button-group-row">
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={loading}
            >
              {loading && !showRazorpay ? <Loader2 className="animate-spin" size={20} /> : 'Add to Cart'}
            </button>

            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={loading}
            >
              {loading && showRazorpay ? <Loader2 className="animate-spin" size={20} /> : 'Buy Now'}
            </button>
          </div>
        </div>

        {successMsg && <div className="success-message">{successMsg}</div>}
      </div>

      {showRazorpay && (
        <RazorpayDemo
          amount={product.price * quantity * 100}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowRazorpay(false)}
        />
      )}
    </div>
  );
}
