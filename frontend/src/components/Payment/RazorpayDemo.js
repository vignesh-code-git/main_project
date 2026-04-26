'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Shield, CreditCard, Smartphone, Landmark, CheckCircle2, Loader2, QrCode, MoreHorizontal, ChevronRight } from 'lucide-react';
import './RazorpayDemo.css';

export default function RazorpayDemo({ amount, onSuccess, onCancel }) {
  const [step, setStep] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'qr' | 'processing' | 'success'
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || 'Guest User';

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  // High quality icon links
  const icons = {
    gpay: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",
    phonepe: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",
    visa: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg",
    mastercard: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",
    sbi: "https://upload.wikimedia.org/wikipedia/en/thumb/5/58/State_Bank_of_India_logo.svg/1024px-State_Bank_of_India_logo.svg.png",
    hdfc: "https://upload.wikimedia.org/wikipedia/commons/7/72/HDFC_Bank_Logo.svg",
    illustration: "https://cdn.razorpay.com/static_assets/checkout/illustration.webp",
    rzp_logo: "https://cdn.razorpay.com/static_assets/checkout/rzp_logo_white.png",
    qr: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=shopco@razorpay&pn=SHOP.CO&am=${amount / 100}&cu=INR`
  };

  return (
    <div className="rzp-overlay">
      <div className="rzp-modal-v2">
        {/* LEFT SIDEBAR - BLUE */}
        <div className="rzp-sidebar">
          <div className="rzp-sidebar-header">
            <div className="rzp-logo-box">S</div>
            <div className="rzp-shop-name">SHOP.CO</div>
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

          <div className="rzp-sidebar-illustration">
            <img src={icons.illustration} alt="Payment Illustration" />
          </div>

          <div className="rzp-secured-logo">
            <span>Secured by</span>
            <img src={icons.rzp_logo} alt="Razorpay" />
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
              <h3>Payment Successful</h3>
              <p>Transaction ID: pay_{Math.random().toString(36).substr(2, 9)}</p>
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
                    <img src={icons.visa} style={{ height: '10px' }} />
                    <img src={icons.mastercard} style={{ height: '10px' }} />
                  </div>
                </div>
                <div className={`nav-item ${step === 'netbanking' ? 'active' : ''}`} onClick={() => setStep('netbanking')}>
                  <span>Netbanking</span>
                  <div className="nav-icons-row">
                    <img src={icons.sbi} style={{ height: '10px' }} />
                    <img src={icons.hdfc} style={{ height: '10px' }} />
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
                      <img src={icons.visa} style={{ height: '14px' }} />
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

                    <div className="rbi-check-v2">
                      <input type="checkbox" id="rbi-cb" defaultChecked />
                      <label htmlFor="rbi-cb">Save this card as per RBI guidelines</label>
                    </div>

                    <button className="rzp-continue-btn" onClick={handlePay}>Continue</button>
                  </div>
                )}

                {step === 'upi' && (
                  <div className="upi-form-v2">
                    <div className="form-title-v2">Pay using UPI ID</div>
                    <div className="input-group-v3">
                      <input type="text" placeholder="Enter UPI ID (e.g. user@bank)" />
                    </div>
                    <button className="rzp-continue-btn" onClick={handlePay}>Pay Now</button>

                    <div className="qr-integrated-section">
                      <div className="qr-divider"><span>OR SCAN QR CODE</span></div>
                      <div className="qr-display-box-small">
                        <img src={icons.qr} alt="Payment QR" />
                        <div className="qr-logo-overlay-small">S</div>
                      </div>
                      <p className="qr-hint-small">Scan using any UPI App</p>
                    </div>
                  </div>
                )}

                {step === 'netbanking' && (
                  <div className="nb-form-v2">
                    <div className="form-title-v2">Select Your Bank</div>
                    <div className="nb-grid">
                      <div className="nb-item" onClick={handlePay}><img src={icons.sbi} /><span>SBI</span></div>
                      <div className="nb-item" onClick={handlePay}><img src={icons.hdfc} /><span>HDFC</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
