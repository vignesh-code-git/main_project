'use client';

import './ConfirmModal.css';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <AlertCircle size={28} color="#FF4D4D" />
          </div>
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <p className="modal-message">{message}</p>
        
        <div className="modal-actions">
          {cancelText && (
            <button className="btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
