'use client';

import { useSelector } from 'react-redux';
import './OrderSummary.css';

export default function OrderSummary() {
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const discount = totalAmount * 0.2; // Mock 20% discount
  const deliveryFee = 15;
  const grandTotal = totalAmount - discount + deliveryFee;

  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      
      <div className="summary-row">
        <span>Subtotal</span>
        <span className="value">₹{totalAmount}</span>
      </div>
      
      <div className="summary-row discount">
        <span>Discount (-20%)</span>
        <span className="value">-₹{Math.round(discount)}</span>
      </div>
      
      <div className="summary-row">
        <span>Delivery Fee</span>
        <span className="value">₹{deliveryFee}</span>
      </div>
      
      <div className="summary-divider"></div>
      
      <div className="summary-row total">
        <span>Total</span>
        <span className="value">₹{Math.round(grandTotal)}</span>
      </div>
      
      <div className="promo-code">
        <div className="promo-input">
          <span className="promo-icon">🏷️</span>
          <input type="text" placeholder="Add promo code" />
        </div>
        <button className="apply-btn">Apply</button>
      </div>
      
      <button className="checkout-btn">
        Go to Checkout <span>→</span>
      </button>
    </div>
  );
}
