'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import './seller-auth.css';

export default function SellerAuthChoice() {
  const router = useRouter();

  return (
    <div className="seller-auth-container">
      <div className="auth-card choice-card">
        <h2>BECOME A SELLER</h2>
        <p>Choose how you want to proceed with your business on SHOP.CO</p>
        
        <div className="choice-buttons">
          <button 
            className="auth-btn choice-btn login-choice"
            onClick={() => router.push('/auth/login?type=seller')}
          >
            <div className="choice-icon"><LogIn size={20} /></div>
            <div className="choice-text">
              <span className="choice-title">SELLER LOGIN</span>
              <span className="choice-desc">Already have a store? Manage it here.</span>
            </div>
            <ArrowRight size={18} className="arrow-hint" />
          </button>

          <button 
            className="auth-btn choice-btn signup-choice"
            onClick={() => router.push('/seller/signup')}
          >
            <div className="choice-icon"><UserPlus size={20} /></div>
            <div className="choice-text">
              <span className="choice-title">CREATE SELLER ACCOUNT</span>
              <span className="choice-desc">New here? Register and start selling.</span>
            </div>
            <ArrowRight size={18} className="arrow-hint" />
          </button>
        </div>

        <div className="toggle-auth">
          Need help? <span onClick={() => router.push('/about')}>Contact Support</span>
        </div>
      </div>
    </div>
  );
}
