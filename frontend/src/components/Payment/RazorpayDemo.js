'use client';

import { useState } from 'react';
import { Shield, CreditCard, Smartphone, Landmark, CheckCircle2, Loader2 } from 'lucide-react';
import './RazorpayDemo.css';

export default function RazorpayDemo({ amount, onSuccess, onCancel }) {
  const [step, setStep] = useState('options'); // 'options' | 'processing' | 'success'
  const [selectedMethod, setSelectedMethod] = useState('card');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="rzp-overlay">
      <div className="rzp-modal">
        <div className="rzp-header">
          <div className="rzp-brand">
            <div className="rzp-logo-circle">R</div>
            <div>
              <h4>SHOP.CO Payment</h4>
              <p>order_demo_88291</p>
            </div>
          </div>
          <div className="rzp-amount">
            ₹{(amount / 100).toFixed(2)}
          </div>
          <button className="rzp-close" onClick={onCancel}>✕</button>
        </div>

        {step === 'options' && (
          <div className="rzp-body">
            <div className="rzp-section-title">PREFERRED PAYMENT METHODS</div>
            <div className="rzp-methods">
              <div 
                className={`rzp-method-item ${selectedMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('upi')}
              >
                <Smartphone size={20} />
                <span>UPI (Google Pay, PhonePe)</span>
              </div>
              <div 
                className={`rzp-method-item ${selectedMethod === 'card' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('card')}
              >
                <CreditCard size={20} />
                <span>Cards (Visa, Mastercard, RuPay)</span>
              </div>
              <div 
                className={`rzp-method-item ${selectedMethod === 'netbanking' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('netbanking')}
              >
                <Landmark size={20} />
                <span>Netbanking</span>
              </div>
            </div>

            <button className="rzp-pay-btn" onClick={handlePay}>
              PAY ₹{(amount / 100).toFixed(2)}
            </button>
            <div className="rzp-footer">
              <Shield size={14} /> Secured by Razorpay
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="rzp-body rzp-center">
            <Loader2 className="rzp-spinner" size={48} />
            <h3>Processing Payment</h3>
            <p>Please do not refresh or close the window</p>
          </div>
        )}

        {step === 'success' && (
          <div className="rzp-body rzp-center rzp-success-view">
            <CheckCircle2 className="rzp-success-icon" size={64} />
            <h3>Payment Successful</h3>
            <p>Your transaction has been completed</p>
          </div>
        )}
      </div>
    </div>
  );
}
