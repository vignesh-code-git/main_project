'use client';

import { useSelector } from 'react-redux';
import { Tag, ArrowRight } from 'lucide-react';
import './OrderSummary.css';

export default function OrderSummary() {
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  
  // Design values from reference image
  const discountRate = 0.20; // 20%
  const discountAmount = totalAmount * discountRate;
  const deliveryFee = totalAmount > 0 ? 15 : 0;
  const grandTotal = totalAmount - discountAmount + deliveryFee;

  return (
    <div className="order-summary-card">
      <h2 className="summary-title">Order Summary</h2>
      
      <div className="summary-details">
        <div className="summary-line">
          <span className="label">Subtotal</span>
          <span className="value">₹{totalAmount}</span>
        </div>
        
        <div className="summary-line">
          <span className="label">Discount (-20%)</span>
          <span className="value discount-value">-₹{Math.round(discountAmount)}</span>
        </div>
        
        <div className="summary-line">
          <span className="label">Delivery Fee</span>
          <span className="value">₹{deliveryFee}</span>
        </div>
        
        <div className="summary-divider"></div>
        
        <div className="summary-line total-line">
          <span className="label">Total</span>
          <span className="value">₹{Math.round(grandTotal)}</span>
        </div>
      </div>
      
      <div className="promo-section">
        <div className="promo-input-wrapper">
          <Tag size={20} className="promo-icon" />
          <input type="text" placeholder="Add promo code" />
        </div>
        <button className="apply-promo-btn">Apply</button>
      </div>
      
      <button className="checkout-action-btn" disabled={totalAmount === 0}>
        Go to Checkout <ArrowRight size={20} />
      </button>
    </div>
  );
}
