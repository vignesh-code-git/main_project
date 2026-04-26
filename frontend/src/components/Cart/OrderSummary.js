import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { clearCart } from '@/lib/redux/slices/cartSlice';
import { Tag, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import RazorpayDemo from '../Payment/RazorpayDemo';
import './OrderSummary.css';

export default function OrderSummary() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const cartItems = useSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Design values from reference image
  const discountRate = 0.20; // 20%
  const discountAmount = totalAmount * discountRate;
  const deliveryFee = totalAmount > 0 ? 15 : 0;
  const grandTotal = totalAmount - discountAmount + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please log in to proceed with checkout.');
      router.push('/auth/login');
      return;
    }

    if (cartItems.length === 0) return;
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async () => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        totalAmount: Math.round(grandTotal),
        shippingAddress: '123 High Street, Downtown, Mumbai',
        zipcode: '400001',
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.selectedSize || 'Standard',
          color: item.selectedColor || 'Default'
        }))
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        dispatch(clearCart());
        router.push('/profile');
      } else {
        throw new Error('Failed to save order after payment');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      
      <button 
        className="checkout-action-btn" 
        disabled={totalAmount === 0 || loading}
        onClick={handleCheckout}
      >
        {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : <>Go to Checkout <ArrowRight size={20} /></>}
      </button>

      {showRazorpay && (
        <RazorpayDemo 
          amount={Math.round(grandTotal) * 100} 
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowRazorpay(false)}
        />
      )}
    </div>
  );
}
