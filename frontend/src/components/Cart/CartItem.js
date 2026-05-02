'use client';

import { useDispatch } from 'react-redux';
import { updateCartItem, removeCartItem } from '@/lib/redux/slices/cartSlice';
import { Trash2, Minus, Plus } from 'lucide-react';
import './CartItem.css';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  // Prioritize the color-specific image from the cart slice
  const imageUrl = item.image || (item.imageUrl || '');

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
            onClick={() => dispatch(removeCartItem(item.cartItemId))}
            aria-label="Remove item"
          >
            <Trash2 size={20} color="#FF3333" />
          </button>
        </div>
        
        <p className="item-property">Size: <span>{item.size || 'Large'}</span></p>
        <p className="item-property color-prop">
          Color: 
          <span className="cart-color-swatch" style={{ backgroundColor: (item.color || 'white').toLowerCase() }}></span>
          <span>{item.color || 'White'}</span>
        </p>
        
        <div className="details-footer">
          <span className="item-price">₹{item.price}</span>
          <div className="quantity-control">
            <button 
              className="qty-btn" 
              onClick={() => {
                if (item.quantity > 1) {
                  dispatch(updateCartItem({ id: item.cartItemId, quantity: item.quantity - 1 }));
                } else {
                  dispatch(removeCartItem(item.cartItemId));
                }
              }}
            >
              <Minus size={18} />
            </button>
            <span className="qty-value">{item.quantity}</span>
            <button 
              className="qty-btn" 
              onClick={() => dispatch(updateCartItem({ id: item.cartItemId, quantity: item.quantity + 1 }))}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
