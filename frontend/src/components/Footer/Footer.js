import { Mail } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="newsletter-section">
        <div className="container newsletter-container">
          <h2>STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
          <div className="newsletter-form">
            <div className="input-group">
              <Mail size={20} className="mail-icon" />
              <input type="email" placeholder="Enter your email address" />
            </div>
            <button className="subscribe-btn">Subscribe to Newsletter</button>
          </div>
        </div>
      </div>

      <div className="container footer-content">
        <div className="footer-brand">
          <h1 className="footer-logo">SHOP.CO</h1>
          <p>We have clothes that suit your style and which you're proud to wear. From women to men.</p>
          <div className="social-links">
            <Link href="#" className="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.59,4 11.64,5.95 11.64,8.35C11.64,8.7 11.68,9.03 11.75,9.34C8.12,9.16 4.91,7.41 2.76,4.77C2.38,5.43 2.16,6.2 2.16,7.03C2.16,8.55 2.93,9.9 4.09,10.67C3.38,10.65 2.72,10.46 2.14,10.14C2.14,10.16 2.14,10.17 2.14,10.19C2.14,12.31 3.64,14.08 5.64,14.48C5.27,14.58 4.88,14.63 4.49,14.63C4.21,14.63 3.94,14.61 3.68,14.56C4.23,16.29 5.83,17.55 7.74,17.59C6.25,18.76 4.37,19.46 2.32,19.46C1.97,19.46 1.62,19.44 1.28,19.4C3.21,20.64 5.5,21.35 7.96,21.35C16,21.35 20.39,14.71 20.39,8.96C20.39,8.77 20.39,8.58 20.38,8.39C21.23,7.77 21.97,7 22.46,6Z"/></svg>
            </Link>
            <Link href="#" className="social-icon active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10.003 10.003 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
            </Link>
            <Link href="#" className="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4A3.6,3.6 0 0,0 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6A3.6,3.6 0 0,0 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/></svg>
            </Link>
            <Link href="#" className="social-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21.03C9.5,20.81 9.5,20.24 9.5,19.44C6.73,20.04 6.14,18.1 6.14,18.1C5.69,16.96 5.03,16.66 5.03,16.66C4.12,16.04 5.1,16.05 5.1,16.05C6.1,16.12 6.63,17.09 6.63,17.09C7.5,18.59 8.94,18.16 9.5,17.91C9.6,17.27 9.85,16.84 10.12,16.6C7.91,16.35 5.59,15.5 5.59,11.69C5.59,10.6 5.98,9.72 6.62,9.03C6.52,8.78 6.18,7.76 6.72,6.39C6.72,6.39 7.56,6.12 9.47,7.41C10.27,7.19 11.13,7.08 11.98,7.08C12.83,7.08 13.69,7.19 14.49,7.41C16.4,6.12 17.24,6.39 17.24,6.39C17.78,7.76 17.44,8.78 17.34,9.03C17.98,9.72 18.37,10.6 18.37,11.69C18.37,15.51 16.05,16.35 13.84,16.59C14.2,16.9 14.5,17.5 14.5,18.44C14.5,19.78 14.5,20.86 14.5,21.03C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/></svg>
            </Link>
          </div>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h3>COMPANY</h3>
            <ul>
              <li>About</li>
              <li>Features</li>
              <li>Works</li>
              <li>Career</li>
            </ul>
          </div>
          <div className="link-group">
            <h3>HELP</h3>
            <ul>
              <li>Customer Support</li>
              <li>Delivery Details</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div className="link-group">
            <h3>FAQ</h3>
            <ul>
              <li>Account</li>
              <li>Manage Deliveries</li>
              <li>Orders</li>
              <li>Payments</li>
            </ul>
          </div>
          <div className="link-group">
            <h3>RESOURCES</h3>
            <ul>
              <li>Free eBooks</li>
              <li>Development Tutorial</li>
              <li>How to - Blog</li>
              <li>Youtube Playlist</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>Shop.co © 2000-2023, All Rights Reserved</p>
          <div className="payment-methods">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg" alt="Google Pay" />
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
