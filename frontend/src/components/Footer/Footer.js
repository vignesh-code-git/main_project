import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="newsletter-section">
        <div className="container newsletter-container">
          <h2>STAY UP TO DATE ABOUT OUR LATEST OFFERS</h2>
          <div className="newsletter-form">
            <div className="input-group">
              <span className="email-icon">✉️</span>
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
            <span>🐦</span> <span>👤</span> <span>📸</span> <span>🐙</span>
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
            💳 💳 💳 💳 💳
          </div>
        </div>
      </div>
    </footer>
  );
}
