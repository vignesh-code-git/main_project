'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Shield, CreditCard, Smartphone, Landmark, CheckCircle2, Loader2, QrCode, MoreHorizontal, ChevronRight } from 'lucide-react';
import './RazorpayDemo.css';

export default function RazorpayDemo({ amount, onSuccess, onCancel }) {
  const [step, setStep] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'qr' | 'cod' | 'processing' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || 'Guest User';
  const [selectedBankName, setSelectedBankName] = useState('');

  const handlePay = (method) => {
    setPaymentMethod(method);
    setLoading(true);
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(method);
      }, 2000);
    }, 2500);
  };

  // High quality icon links
  const icons = {
    gpay: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
    phonepe: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",
    visa: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/visa.svg",
    mastercard: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/mastercard.svg",
    paypal: "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat/paypal.svg",
    sbi: "https://cdn.razorpay.com/bank/SBIN.gif",
    hdfc: "https://cdn.razorpay.com/bank/HDFC.gif",
    icici: "https://cdn.razorpay.com/bank/ICIC.gif",
    axis: "https://cdn.razorpay.com/bank/UTIB.gif",
    qr: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=shopco@razorpay&pn=SHOP.CO&am=${amount / 100}&cu=INR`
  };

  // Professional Security Shield Icon - Solid Blue
  const SecureIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3395FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '4px' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );

  return (
    <div className="rzp-overlay">
      <div className="rzp-modal-v2">
        {/* LEFT SIDEBAR - BLUE */}
        <div className="rzp-sidebar">
          <div className="rzp-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="rzp-logo-box">S</div>
              <div className="rzp-shop-name">SHOP.CO</div>
            </div>
            <button className="rzp-mobile-close" onClick={onCancel}>
              <MoreHorizontal size={20} color="rgba(255,255,255,0.6)" style={{ marginRight: '10px' }} />
              <div className="v-divider"></div>
              <span style={{ fontSize: '18px', marginLeft: '10px', opacity: 0.8 }}>✕</span>
            </button>
          </div>

          <div className="rzp-price-summary-box">
            <label>Price Summary</label>
            <div className="rzp-price-large">₹{(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>

          <div className="rzp-user-badge">
            <div className="user-icon-circle"><Smartphone size={14} /></div>
            <div className="user-text">
              Using as <strong>+91 91234 56789</strong>
            </div>
            <ChevronRight size={16} />
          </div>

          <div className="rzp-secured-logo">
            <span className="secured-by-text">Secured by</span>
            <SecureIcon />
            <span className="rzp-name-text">Razorpay</span>
          </div>
        </div>

        {/* RIGHT CONTENT AREA - WHITE */}
        <div className="rzp-main-content">
          <div className="rzp-main-header">
            <h3>Payment Options</h3>
            <div className="header-actions">
              <MoreHorizontal size={18} color="#888" />
              <button className="close-btn-v2" onClick={onCancel}>✕</button>
            </div>
          </div>

          {step === 'success' ? (
            <div className="rzp-center-v2">
              <CheckCircle2 className="rzp-success-icon-v2" size={64} />
              <h3>Order Placed Successfully</h3>
              <div className="payment-method-badge">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : `Paid via ${paymentMethod}`}
              </div>
              <p>Transaction ID: pay_{Math.random().toString(36).substr(2, 9)}</p>
              <p className="success-hint">Your order has been confirmed and will be processed shortly.</p>
            </div>
          ) : loading ? (
            <div className="rzp-center-v2">
              <Loader2 className="rzp-spinner-v2" size={48} />
              <h3>Processing Payment</h3>
              <p>Please wait while we confirm your transaction</p>
            </div>
          ) : (
            <div className="rzp-body-v2">
              {/* Left Nav */}
              <div className="rzp-nav-left">
                <div className="nav-section-label">RECOMMENDED</div>
                <div className={`nav-item ${step === 'upi' || step === 'qr' ? 'active' : ''}`} onClick={() => setStep('upi')}>
                  <span>UPI</span>
                  <div className="nav-icons-row">
                    <img src={icons.gpay} style={{ height: '10px' }} />
                    <img src={icons.phonepe} style={{ height: '10px' }} />
                  </div>
                </div>
                <div className={`nav-item ${step === 'card' ? 'active' : ''}`} onClick={() => setStep('card')}>
                  <span>Cards</span>
                  <div className="nav-icons-row">
                    <img src={icons.visa} style={{ height: '14px' }} />
                    <img src={icons.mastercard} style={{ height: '14px' }} />
                  </div>
                </div>

                <div className="nav-section-label" style={{ marginTop: '20px' }}>MORE METHODS</div>
                <div className={`nav-item ${step === 'netbanking' ? 'active' : ''}`} onClick={() => setStep('netbanking')}>
                  <span>Netbanking</span>
                  <div className="nav-icons-row">
                    <img src={icons.sbi} style={{ height: '14px' }} />
                    <img src={icons.hdfc} style={{ height: '14px' }} />
                  </div>
                </div>
                <div className={`nav-item ${step === 'cod' ? 'active' : ''}`} onClick={() => setStep('cod')}>
                  <span>Pay on Delivery</span>
                  <div className="nav-icons-row">
                    <div className="cod-label">Cash/UPI</div>
                  </div>
                </div>
              </div>

              {/* Right Detail */}
              <div className="rzp-detail-right">
                {step === 'card' && (
                  <div className="card-form-v2">
                    <div className="form-title-v2">Add a new card</div>
                    <div className="input-group-v3">
                      <input type="text" placeholder="Card Number" defaultValue="4111 1111 1111 1111" />
                      <img src={icons.visa} style={{ height: '20px' }} />
                    </div>
                    <div className="form-row-v2">
                      <div className="input-group-v3 flex-1">
                        <input type="text" placeholder="Expiry (MM/YY)" defaultValue="10 / 29" />
                      </div>
                      <div className="input-group-v3 flex-1">
                        <input type="password" placeholder="CVV" defaultValue="123" />
                      </div>
                    </div>
                    <div className="input-group-v3">
                      <input type="text" placeholder="Cardholder's Name" defaultValue={userName} />
                    </div>

                    <label className="rbi-check-v2">
                      <input type="checkbox" defaultChecked />
                      <span className="rbi-label-text">Save this card as per RBI guidelines</span>
                    </label>

                    <button className="rzp-continue-btn" onClick={() => handlePay('Card')}>Continue</button>
                  </div>
                )}

                {step === 'upi' && (
                  <div className="upi-form-v2">
                    <div className="form-title-v2">Pay using UPI ID</div>
                    <div className="input-group-v3">
                      <input type="text" placeholder="Enter UPI ID (e.g. user@bank)" />
                    </div>
                    <button className="rzp-continue-btn" onClick={() => handlePay('UPI')}>Pay Now</button>

                    <div className="qr-integrated-section">
                      <div className="qr-divider"><span>OR SCAN QR CODE</span></div>
                      <div className="qr-display-box-small">
                        <img src={icons.qr} alt="Payment QR" />
                      </div>
                      <p className="qr-hint-small">Scan using any UPI App</p>
                    </div>
                  </div>
                )}

                {step === 'netbanking' && (
                  <div className="nb-form-v2">
                    <div className="form-title-v2">Select Your Bank</div>
                    <div className="nb-grid">
                      <div 
                        className={`nb-item ${selectedBankName === 'SBI' ? 'active' : ''}`} 
                        onClick={() => setSelectedBankName('SBI')}
                      >
                        <img src={icons.sbi} /><span>SBI</span>
                      </div>
                      <div 
                        className={`nb-item ${selectedBankName === 'HDFC' ? 'active' : ''}`} 
                        onClick={() => setSelectedBankName('HDFC')}
                      >
                        <img src={icons.hdfc} /><span>HDFC</span>
                      </div>
                      <div 
                        className={`nb-item ${selectedBankName === 'ICICI' ? 'active' : ''}`} 
                        onClick={() => setSelectedBankName('ICICI')}
                      >
                        <img src={icons.icici} /><span>ICICI</span>
                      </div>
                      <div 
                        className={`nb-item ${selectedBankName === 'AXIS' ? 'active' : ''}`} 
                        onClick={() => setSelectedBankName('AXIS')}
                      >
                        <img src={icons.axis} /><span>AXIS</span>
                      </div>
                    </div>
                    <button 
                      className="rzp-continue-btn" 
                      disabled={!selectedBankName}
                      onClick={() => handlePay('netbanking')}
                      style={{ marginTop: '24px' }}
                    >
                      {selectedBankName ? `Pay via ${selectedBankName}` : 'Select a Bank to Pay'}
                    </button>
                  </div>
                )}

                {step === 'cod' && (
                  <div className="cod-form-v2">
                    <div className="form-title-v2">Cash on Delivery</div>
                    <div className="cod-info-box">
                      <div className="cod-icon-wrap"><CheckCircle2 size={24} color="#10B981" /></div>
                      <div className="cod-text-wrap">
                        <h4>Pay on Delivery Enabled</h4>
                        <p>You can pay via Cash, UPI or QR code when your order arrives at your doorstep.</p>
                      </div>
                    </div>
                    <ul className="cod-benefits">
                      <li>✓ No advance payment required</li>
                      <li>✓ Secure & hassle-free</li>
                      <li>✓ Pay only after inspection</li>
                    </ul>
                    <button className="rzp-continue-btn" onClick={() => handlePay('cod')}>Place Order</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="rzp-mobile-footer-branding">
          <span className="secured-by-text-v2">Secured by</span>
          <SecureIcon />
          <span className="rzp-name-text-v2">Razorpay</span>
        </div>
      </div>
    </div>
  );
}
