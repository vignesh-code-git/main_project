'use client';

import { useState } from 'react';
import { X, Star, RefreshCw, MessageSquare, Truck, Check, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';
import './OrderActionModal.css';

export default function OrderActionModal({ isOpen, onClose, type, order, onAction }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
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
        }, { withCredentials: true });
      } else if (type === 'Feedback') {
        await axios.post(`${API_BASE_URL}/api/orders/feedback`, {
          orderId: order.id,
          rating,
          courierBehavior,
          comment
        }, { withCredentials: true });
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
      alert(`Failed to submit ${type.toLowerCase()}. Please try again.`);
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
            <h2>{type === 'Return' ? 'Return Request' : type === 'Feedback' ? 'Delivery Feedback' : 'Write a Review'}</h2>
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
