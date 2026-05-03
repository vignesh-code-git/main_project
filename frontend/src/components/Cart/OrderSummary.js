import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { clearUserCart } from '@/lib/redux/slices/cartSlice';
import { Tag, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import RazorpayDemo from '../Payment/RazorpayDemo';
import { API_BASE_URL } from '@/config/api';
import AlertModal from '../AlertModal/AlertModal';
import './OrderSummary.css';

export default function OrderSummary() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', onAction: null });

  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const cartItems = useSelector((state) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchAddresses = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/addresses`, {
            credentials: 'include'
          });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAddresses(data);
            const savedAddressId = localStorage.getItem('activeCheckoutAddressId');
            const savedAddr = savedAddressId ? data.find(a => a.id.toString() === savedAddressId) : null;
            const defaultAddr = data.find(a => a.isDefault) || data[0];
            setSelectedAddress(savedAddr || defaultAddr);
          }
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }
      };
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  const handleSelectAddress = async (addr) => {
    setSelectedAddress(addr);
    setIsAddressModalOpen(false);
    localStorage.setItem('activeCheckoutAddressId', addr.id.toString());
  };

  // Design values from reference image
  const discountRate = 0.20; // 20%
  const discountAmount = totalAmount * discountRate;
  const deliveryFee = totalAmount > 0 ? 15 : 0;
  const grandTotal = totalAmount - discountAmount + deliveryFee;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setAlertConfig({
        isOpen: true,
        title: 'Login Required',
        message: 'Please log in to proceed with checkout.',
        actionText: 'Go to Login',
        onAction: () => router.push('/auth/login')
      });
      return;
    }

    if (!selectedAddress) {
      setAlertConfig({
        isOpen: true,
        title: 'Address Missing',
        message: 'Please add a shipping address in your profile before checking out.',
        actionText: 'Add Address',
        onAction: () => router.push('/profile')
      });
      return;
    }

    if (cartItems.length === 0) return;
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (method) => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        totalAmount: Math.round(grandTotal),
        shippingAddress: [selectedAddress.addressLine, selectedAddress.city, selectedAddress.state, selectedAddress.country].filter(Boolean).join(', '),
        zipcode: selectedAddress.zipCode,
        paymentMethod: method,
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size || '',
          color: item.color || ''
        }))
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      if (res.ok) {
        dispatch(clearUserCart());
        // Trigger a custom event to notify Navbar to refresh notifications
        window.dispatchEvent(new Event('newOrder'));
        router.push('/orders');
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

      <div className="shipping-address-block">
        <div className="address-block-header">
          <h3><MapPin size={16} /> Shipping Address</h3>
          {addresses.length > 0 && (
            <button className="change-address-btn" onClick={() => setIsAddressModalOpen(true)}>Change</button>
          )}
        </div>
        {selectedAddress ? (
          <div className="selected-address-card">
            <strong>{selectedAddress.title} {selectedAddress.isDefault && <span className="def-tag">Default</span>}</strong>
            <p>{selectedAddress.addressLine}</p>
            <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}</p>
          </div>
        ) : (
          <div className="no-address-warning">
            <p>No shipping address found.</p>
            <button onClick={() => router.push('/profile')}>Add Address</button>
          </div>
        )}
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

      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        actionText={alertConfig.actionText}
        onAction={alertConfig.onAction}
      />

      {isAddressModalOpen && (
        <div className="address-selector-modal" onClick={() => setIsAddressModalOpen(false)}>
          <div className="address-selector-content" onClick={e => e.stopPropagation()}>
            <h3>Select Shipping Address</h3>
            <div className="address-list">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                  onClick={() => handleSelectAddress(addr)}
                >
                  <div className="address-option-header">
                    <strong>{addr.title}</strong>
                    {addr.isDefault && <span className="default-tag">Default</span>}
                  </div>
                  <p>{addr.addressLine}</p>
                  <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                </div>
              ))}
            </div>
            <button className="close-selector-btn" onClick={() => setIsAddressModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
