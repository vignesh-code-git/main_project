'use client';

import { useDispatch } from 'react-redux';
import { addItem, removeItem, deleteItem } from '@/lib/redux/slices/cartSlice';
import { Trash2, Minus, Plus } from 'lucide-react';
import './CartItem.css';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  // Get first image from images array or use placeholder
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0].url 
    : (item.imageUrl || '');

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} />
        ) : (
          <div className="img-placeholder"></div>
        )}
      </div>
      
      <div className="cart-item-details">
        <div className="details-header">
          <h3 className="item-name">{item.name}</h3>
          <button 
            className="item-delete-btn" 
            onClick={() => dispatch(deleteItem(item.id))}
            aria-label="Remove item"
          >
            <Trash2 size={20} color="#FF3333" />
          </button>
        </div>
        
        <p className="item-property">Size: <span>{item.size || 'Large'}</span></p>
        <p className="item-property">Color: <span>{item.color || 'White'}</span></p>
        
        <div className="details-footer">
          <span className="item-price">₹{item.price}</span>
          <div className="quantity-control">
            <button 
              className="qty-btn" 
              onClick={() => dispatch(removeItem(item.id))}
            >
              <Minus size={18} />
            </button>
            <span className="qty-value">{item.quantity}</span>
            <button 
              className="qty-btn" 
              onClick={() => dispatch(addItem(item))}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
