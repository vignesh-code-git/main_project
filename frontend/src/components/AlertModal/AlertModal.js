'use client';

import './AlertModal.css';
import { AlertCircle, X } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, title, message, actionText = 'OK', onAction }) {
  if (!isOpen) return null;

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal-content" onClick={e => e.stopPropagation()}>
        <div className="alert-modal-header">
          <div className="alert-modal-icon">
            <AlertCircle size={28} color="#FF9800" />
          </div>
          <button className="alert-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="alert-modal-body">
          <h2 className="alert-modal-title">{title}</h2>
          <p className="alert-modal-message">{message}</p>
        </div>
        
        <div className="alert-modal-actions">
          <button className="alert-btn-action" onClick={() => {
            if (onAction) onAction();
            onClose();
          }}>
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
