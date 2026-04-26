'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addItem } from '@/lib/redux/slices/cartSlice';
import { Loader2 } from 'lucide-react';
import RazorpayDemo from '../Payment/RazorpayDemo';
import './ProductInfo.css';

export default function ProductInfo({ product }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedColor, setSelectedColor] = useState('green');
  const [selectedSize, setSelectedSize] = useState('Large');
  const [quantity, setQuantity] = useState(1);

  const colors = [
    { id: 'green', value: '#4F4631' },
    { id: 'blue', value: '#314F4A' },
    { id: 'darkblue', value: '#31344F' },
  ];

  const sizes = ['Small', 'Medium', 'Large', 'X-Large'];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addItem({
        ...product,
        size: selectedSize,
        color: selectedColor
      }));
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
            <span className="discount-tag">-{Math.round((1 - product.price/product.originalPrice) * 100)}%</span>
          </>
        )}
      </div>
      <p className="product-description">{product.description}</p>

      <div className="selection-group">
        <h4>Select Colors</h4>
        <div className="color-swatches">
          {colors.map(color => (
            <div 
              key={color.id} 
              className={`color-swatch ${selectedColor === color.id ? 'active' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(color.id)}
            >
              {selectedColor === color.id && <span className="check">✓</span>}
            </div>
          ))}
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
        <div className="actions-group">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          <button className="add-to-cart-btn" onClick={handleAddToCart}>Add to Cart</button>
        </div>
        <button 
          className="buy-now-btn" 
          onClick={handleBuyNow} 
          disabled={loading}
        >
          {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Buy Now'}
        </button>
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
