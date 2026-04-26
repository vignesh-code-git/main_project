'use client';

import { useState } from 'react';
import './ProductInfo.css';

export default function ProductInfo({ product }) {
  const [selectedColor, setSelectedColor] = useState('green');
  const [selectedSize, setSelectedSize] = useState('Large');
  const [quantity, setQuantity] = useState(1);

  const colors = [
    { id: 'green', value: '#4F4631' },
    { id: 'blue', value: '#314F4A' },
    { id: 'darkblue', value: '#31344F' },
  ];

  const sizes = ['Small', 'Medium', 'Large', 'X-Large'];

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

      <div className="actions-group">
        <div className="quantity-selector">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
}
