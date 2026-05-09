'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { addItemToCart, fetchCart } from '@/lib/redux/slices/cartSlice';
import { Loader2, MapPin } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import RazorpayDemo from '../Payment/RazorpayDemo';
import AlertModal from '../AlertModal/AlertModal';
import './ProductInfo.css';

export default function ProductInfo({ product, selectedColor, setSelectedColor }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', onAction: null });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [colorsList, setColorsList] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchAddresses = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/addresses`, {
            headers: getAuthHeaders()
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

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/colors`);
        const data = await res.json();
        if (Array.isArray(data)) setColorsList(data);
      } catch (err) {
        console.error('Error fetching colors:', err);
      }
    };
    fetchColors();
  }, []);

  const handleSelectAddress = async (addr) => {
    setSelectedAddress(addr);
    setIsAddressModalOpen(false);
    localStorage.setItem('activeCheckoutAddressId', addr.id.toString());
  };

  const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const colorMap = {};
  colorsList.forEach(c => {
    colorMap[c.name.toLowerCase()] = c.hexCode;
  });

  const productColors = product.color ? product.color.split(',').map(c => c.trim()) : [];


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      await dispatch(addItemToCart({
        productId: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor
      })).unwrap();

      // Refresh cart to get the latest state
      dispatch(fetchCart());

      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setAlertConfig({
        isOpen: true,
        title: 'Login Required',
        message: 'Please log in to proceed with your purchase.',
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

    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (method) => {
    setShowRazorpay(false);
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        totalAmount: product.price * quantity,
        shippingAddress: [selectedAddress.addressLine, selectedAddress.city, selectedAddress.state, selectedAddress.country].filter(Boolean).join(', '),
        zipcode: selectedAddress.zipCode,
        paymentMethod: method,
        items: [{
          id: product.id,
          quantity: quantity,
          price: product.price,
          size: selectedSize || '',
          color: selectedColor || ''
        }]
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        router.push('/orders');
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
      <div 
        className="product-rating reviews-summary-link" 
        onClick={() => {
          const element = document.getElementById('reviews-section');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }}
        style={{ cursor: 'pointer' }}
      >
        <span className="stars">{"★".repeat(Math.floor(product.rating || 0))}</span>
        <span className="rating-text">{product.rating || 0}/5 <span className="review-count-small">(View Reviews)</span></span>
      </div>
      <div className="product-price-section">
        <div className="product-price">
          <span className="current-price">₹{product.price}</span>
          {product.originalPrice && (
            <>
              <span className="original-price">₹{product.originalPrice}</span>
              <span className="discount-tag">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
            </>
          )}
        </div>
        
        <div className="delivery-info-row">
          {product.isFreeDelivery && (
            <span className="free-delivery-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Free Delivery
            </span>
          )}
          <span className="delivery-time-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {product.deliveryDays || '3-5 Days'}
          </span>
        </div>
      </div>

      <p className="product-description">{product.description}</p>

      <div className="product-meta-info">
        <div className="meta-grid">
          <div className="meta-row">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{product.Category?.name || 'N/A'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Brand:</span>
            <span className="meta-value">{product.brand || 'N/A'}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Dress Style:</span>
            <span className="meta-value">{product.style || 'N/A'}</span>
          </div>
          <div className="meta-row stock">
            <span className="meta-label">Stock:</span>
            <span className={`meta-value ${product.stock < 5 ? 'low-stock' : ''}`}>
              {product.stock > 0 ? product.stock : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>

      <div className="selection-group">
        <h4>Select Colors</h4>
        <div className="color-swatches">
          {productColors.length > 0 ? (
            productColors.map((colorName, index) => {
              const isSelected = selectedColor?.trim().toLowerCase() === colorName.trim().toLowerCase();
              return (
                <div
                  key={`${colorName}-${index}`}
                  className={`color-swatch ${isSelected ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: colorMap[colorName.toLowerCase().trim()] || colorName,
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={() => {
                    console.log('Selecting color:', colorName.trim());
                    setSelectedColor(colorName.trim());
                  }}
                >
                  {isSelected && <span className="check">✓</span>}
                </div>
              );
            })
          ) : (
            <p>No colors specified</p>
          )}
        </div>
      </div>

      <div className="selection-group">
        <h4>Choose Size</h4>
        <div className="size-buttons">
          {sizes.length > 0 ? (
            sizes.map(size => (
              <button
                key={size}
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))
          ) : (
            <p className="no-data">No sizes specified for this product.</p>
          )}
        </div>
      </div>

      <div className="shipping-address-block-mini">
        <div className="address-block-header-mini">
          <h4><MapPin size={14} /> Deliver to</h4>
          {addresses.length > 0 && (
            <button className="change-address-btn-mini" onClick={() => setIsAddressModalOpen(true)}>Change</button>
          )}
        </div>
        {selectedAddress ? (
          <div className="selected-address-card-mini">
            <strong>{selectedAddress.title} {selectedAddress.isDefault && <span className="def-tag">Default</span>}</strong>
            <p>{selectedAddress.addressLine}, {selectedAddress.city} - {selectedAddress.zipCode}</p>
          </div>
        ) : (
          <div className="no-address-warning-mini">
            <p>No shipping address found.</p>
            <button onClick={() => router.push('/profile')}>Add Address</button>
          </div>
        )}
      </div>

      <div className="actions-group-container sticky-actions">
        <div className="all-actions-row">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <div className="button-group-row">
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
