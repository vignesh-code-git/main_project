'use client';

import { CheckCircle, X } from 'lucide-react';
import './SuccessModal.css';

export default function SuccessModal({ isOpen, onClose, title, message, actionText = "View Cart", onAction }) {
  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={e => e.stopPropagation()}>
        <div className="success-modal-header">
          <div className="header-main-content">
            <div className="success-icon-wrapper">
              <CheckCircle size={28} className="success-icon" />
            </div>
            <h2 className="success-title">{title}</h2>
          </div>
          <button className="success-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="success-modal-body">
          <p className="success-message">{message}</p>
        </div>
        
        <div className="success-modal-footer">
          <button className="success-btn-secondary" onClick={onClose}>
            Continue Shopping
          </button>
          {actionText && onAction && (
            <button className="success-btn-primary" onClick={onAction}>
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
