'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addItem } from '@/lib/redux/slices/cartSlice';
import { Loader2 } from 'lucide-react';
import RazorpayDemo from '../Payment/RazorpayDemo';
import './ProductInfo.css';

export default function ProductInfo({ product, selectedColor, setSelectedColor }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState('Large');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const colorMap = {
    'Olive': '#4F4F31',
    'Navy': '#1A237E',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Gray': '#808080',
    'Red': '#FF0000',
    'Blue': '#0000FF'
  };

  const productColors = product.color ? product.color.split(',').map(c => c.trim()) : [];

  const sizes = ['Small', 'Medium', 'Large', 'X-Large'];

  const handleAddToCart = () => {
    setLoading(true);
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        dispatch(addItem({
          ...product,
          size: selectedSize,
          color: selectedColor
        }));
      }
      setLoading(false);
      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 500);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert('Please log in to proceed with purchase.');
      router.push('/auth/login');
      return;
    }
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async () => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        totalAmount: product.price * quantity,
        shippingAddress: '123 High Street, Downtown, Mumbai',
        zipcode: '400001',
        items: [{
          id: product.id,
          quantity: quantity,
          price: product.price,
          size: selectedSize,
          color: selectedColor
        }]
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
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
      </div>
      <p className="product-description">{product.description}</p>

      <div className="selection-group">
        <h4>Select Colors</h4>
        <div className="color-swatches">
          {productColors.length > 0 ? (
            productColors.map(colorName => (
              <div
                key={colorName}
                className={`color-swatch ${selectedColor === colorName ? 'active' : ''}`}
                style={{ backgroundColor: colorMap[colorName] || '#CCC' }}
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
          {sizes.map(size => (
            <button
              key={size}
              className={`size-btn ${selectedSize === size ? 'active' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="actions-group-container">
        <div className="all-actions-row">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          
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
