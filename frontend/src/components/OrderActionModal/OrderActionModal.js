'use client';

import { useState } from 'react';
import { X, Star, RefreshCw, MessageSquare, Truck, Check, ChevronDown, Package, Copy } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/config/api';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './OrderActionModal.css';

export default function OrderActionModal({ isOpen, onClose, type, order, onAction }) {
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopyFullDetails = () => {
    if (!order) return;
    
    const details = `ORDER DETAILS
-------------------
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status}
Total Amount: ₹${order.totalAmount}

ITEMS
-------------------
${order.OrderItems?.map(item => `${item.quantity}x ${item.Product?.name} (Size: ${item.size}, Color: ${item.color}) - ₹${item.price}`).join('\n')}

SHIPPING TO
-------------------
${user?.name || ''}
${user?.phoneNumber ? user.phoneNumber + '\n' : ''}${user?.email ? user.email + '\n' : ''}${order.shippingAddress} - ${order.zipcode}`;

    navigator.clipboard.writeText(details.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Size doesn\'t fit');
  const [courierBehavior, setCourierBehavior] = useState('Excellent');

  const returnReasons = ["Size doesn't fit", "Product not as described", "Changed my mind", "Defective/Damaged"];
  const behaviors = ["Excellent", "Professional", "Average", "Poor"];

  if (!isOpen || !order) return null;

  const handleRating = (val) => setRating(val);

  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (type === 'Return') {
        await axios.post(`${API_BASE_URL}/api/orders/return`, {
          orderId: order.id,
          itemIds: selectedItems,
          reason: returnReason,
          comment
        }, { 
          headers: getAuthHeaders()
        });
      } else if (type === 'Feedback') {
        await axios.post(`${API_BASE_URL}/api/orders/feedback`, {
          orderId: order.id,
          rating,
          courierBehavior,
          comment
        }, { 
          headers: getAuthHeaders()
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setStep(1);
        setRating(0);
        setComment('');
        setSelectedItems([]);
      }, 2500);
    } catch (err) {
      console.error(`Error submitting ${type}:`, err);
      const errorMsg = err.response?.data?.message || err.message || 'Please try again.';
      alert(`Failed to submit ${type.toLowerCase()}. ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (success) {
      return (
        <div className="modal-success-state">
          <div className="success-icon-circle">
            <Check size={40} color="#fff" />
          </div>
          <h2>Submission Successful!</h2>
          <p>Thank you for your request. We've received your {type === 'Return' ? 'return request' : 'feedback'} and will process it shortly.</p>
        </div>
      );
    }

    switch (type) {
      case 'Return':
        return (
          <div className="modal-form-content">
            <h3>Select items to return</h3>
            <div className="item-selection-list">
              {order.OrderItems?.map((item, idx) => (
                <div key={idx} className={`selectable-item ${selectedItems.includes(item.id) ? 'selected' : ''}`} onClick={() => toggleItem(item.id)}>
                  <div className="item-check">{selectedItems.includes(item.id) && <Check size={12} />}</div>
                  <div className="item-info">
                    <span>{item.Product?.name}</span>
                    <small>Size: {item.size} | Color: {item.color}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="form-group-v2">
              <label>Reason for return</label>
              <div className="modal-custom-dropdown">
                <button className={`modal-dropdown-trigger ${isDropdownOpen ? 'open' : ''}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <span>{returnReason}</span>
                  <ChevronDown size={18} className={isDropdownOpen ? 'rotate' : ''} />
                </button>
                {isDropdownOpen && (
                  <ul className="modal-dropdown-menu">
                    {returnReasons.map(reason => (
                      <li key={reason} className={returnReason === reason ? 'active' : ''} onClick={() => { setReturnReason(reason); setIsDropdownOpen(false); }}>
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="form-group-v2">
              <label>Additional Comments</label>
              <textarea placeholder="Tell us more..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <button className="modal-submit-btn" disabled={loading || selectedItems.length === 0} onClick={handleSubmit}>
              {loading ? 'Processing...' : 'Submit Return Request'}
            </button>
          </div>
        );

      case 'Feedback':
        return (
          <div className="modal-form-content">
            <h3>Rate your delivery experience</h3>
            <div className="delivery-rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={32} 
                  fill={star <= rating ? "#FFC107" : "transparent"} 
                  color={star <= rating ? "#FFC107" : "#DDD"}
                  onClick={() => handleRating(star)}
                  className="star-icon"
                />
              ))}
            </div>
            <div className="form-group-v2">
              <label>How was the courier's behavior?</label>
              <div className="modal-custom-dropdown">
                <button className={`modal-dropdown-trigger ${isDropdownOpen ? 'open' : ''}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <span>{courierBehavior}</span>
                  <ChevronDown size={18} className={isDropdownOpen ? 'rotate' : ''} />
                </button>
                {isDropdownOpen && (
                  <ul className="modal-dropdown-menu">
                    {behaviors.map(b => (
                      <li key={b} className={courierBehavior === b ? 'active' : ''} onClick={() => { setCourierBehavior(b); setIsDropdownOpen(false); }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="form-group-v2">
              <label>Tell us more about the delivery</label>
              <textarea placeholder="Your feedback helps us improve..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <button className="modal-submit-btn" disabled={loading || rating === 0} onClick={handleSubmit}>
              {loading ? 'Sending...' : 'Submit Feedback'}
            </button>
          </div>
        );

      case 'Reviews':
        return (
          <div className="modal-form-content">
            <h3>Which product would you like to review?</h3>
            <div className="item-review-list">
              {order.OrderItems?.map((item, idx) => (
                <div key={idx} className="reviewable-item" onClick={() => window.location.href = `/product/${item.Product?.id}?review=true`}>
                  <div className="item-info">
                    <strong>{item.Product?.name}</strong>
                    <p>Size: {item.size} | Color: {item.color}</p>
                  </div>
                  <ChevronLeft size={18} className="rotate-180" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'Order Details':
        return (
          <div className="modal-form-content" style={{ paddingBottom: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Order Summary</h3>
              <button 
                onClick={handleCopyFullDetails} 
                title={isCopied ? "Copied!" : "Copy Full Details"}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#666', transition: 'color 0.2s' }}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div style={{ background: '#f9f9f9', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}><strong>Order ID:</strong> #{order.id.toString().slice(-8).toUpperCase()}</p>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p style={{ margin: '0', fontSize: '13px' }}><strong>Total:</strong> ₹{order.totalAmount} | <strong>Status:</strong> {order.status}</p>
            </div>
            
            <h3 style={{ marginBottom: '12px', fontSize: '15px' }}>Items</h3>
            <div className="item-review-list" style={{ marginBottom: '16px', gap: '8px' }}>
              {order.OrderItems?.map((item, idx) => (
                <div key={idx} className="order-detail-item">
                  <div className="item-info">
                    <strong>{item.Product?.name}</strong>
                    <p style={{ fontSize: '13px', margin: '4px 0' }}>Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
                    <p style={{ marginTop: '2px', fontWeight: 'bold', fontSize: '14px' }}>₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: '12px', fontSize: '15px' }}>Shipping Address</h3>
            <div style={{ background: '#f9f9f9', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
              <p style={{ margin: '0 0 2px 0' }}><strong>{user?.name}</strong></p>
              {user?.phoneNumber && <p style={{ margin: '0 0 2px 0' }}>{user?.phoneNumber}</p>}
              {user?.email && <p style={{ margin: '0 0 6px 0', color: '#666' }}>{user?.email}</p>}
              <p style={{ margin: '0' }}>{order.shippingAddress} - {order.zipcode}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay-v2">
      <div className="modal-container-v2">
        <div className="modal-header-v2">
          <div className="header-title-group">
            {type === 'Return' && <RefreshCw size={20} />}
            {type === 'Feedback' && <Truck size={20} />}
            {type === 'Reviews' && <MessageSquare size={20} />}
            {type === 'Order Details' && <Package size={20} />}
            <h2>{type === 'Return' ? 'Return Request' : type === 'Feedback' ? 'Delivery Feedback' : type === 'Order Details' ? 'Order Details' : 'Write a Review'}</h2>
          </div>
          <button className="close-modal-v2" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body-v2">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function ChevronLeft({ size, className }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m15 18-6-6 6-6"/>
        </svg>
    )
}
