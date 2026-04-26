'use client';

import { useDispatch } from 'react-redux';
import { addItem, removeItem } from '@/lib/redux/slices/cartSlice';
import './CartItem.css';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {/* item img placeholder */}
        <div className="img-placeholder"></div>
      </div>
      
      <div className="cart-item-details">
        <div className="details-header">
          <h3>{item.name}</h3>
          <button className="delete-btn" onClick={() => dispatch(removeItem(item.id))}>🗑️</button>
        </div>
        <p className="item-meta">Size: <span>{item.size || 'Large'}</span></p>
        <p className="item-meta">Color: <span>{item.color || 'White'}</span></p>
        
        <div className="details-footer">
          <span className="item-price">₹{item.price}</span>
          <div className="quantity-selector-mini">
            <button onClick={() => dispatch(removeItem(item.id))}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => dispatch(addItem(item))}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}
