import './About.css';
import { ShoppingBag, Users, Award, ShieldCheck, Truck, Star, Headphones, Brain, Code, Database } from 'lucide-react';

const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export default function AboutPage() {


  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1 className="hero-title">About <span>SHOP.CO</span></h1>
          <p className="hero-subtitle">Redefining the modern shopping experience with quality and style.</p>
        </div>
      </div>

      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2>Our Story</h2>
              <p>
                Founded with a passion for style and a commitment to quality, SHOP.CO has grown from a small
                boutique to a leading e-commerce destination. We believe that everyone deserves to look
                and feel their best, without compromising on comfort or budget.
              </p>
              <p>
                Our journey began with a simple idea: to create a platform where fashion meets convenience.
                Today, we serve thousands of customers worldwide, offering a curated selection of the finest
                apparel and accessories.
              </p>
            </div>
            <div className="about-stats">
              <div className="stat-card">
                <ShoppingBag size={32} />
                <h3>200+</h3>
                <p>Premium Brands</p>
              </div>
              <div className="stat-card">
                <Users size={32} />
                <h3>30,000+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="stat-card">
                <Award size={32} />
                <h3>50+</h3>
                <p>Fashion Awards</p>
              </div>
              <div className="stat-card">
                <ShieldCheck size={32} />
                <h3>100%</h3>
                <p>Secure Shopping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon"><Star size={48} /></div>
              <h3>Curated Selection</h3>
              <p>We handpick every item in our collection to ensure it meets our high standards of style and quality.</p>
            </div>
            <div className="value-item">
              <div className="value-icon"><Truck size={48} /></div>
              <h3>Fast Delivery</h3>
              <p>Get your favorite styles delivered to your doorstep with our lightning-fast shipping options.</p>
            </div>
            <div className="value-item">
              <div className="value-icon"><Headphones size={48} /></div>
              <h3>Expert Support</h3>
              <p>Our dedicated customer support team is always here to help you with any questions or concerns.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="developer-full-width">
        <div className="container">
          <div className="dev-premium-card">
            <div className="dev-header">
              <h2 className="created-by">CREATED BY VIGHESH</h2>
              <div className="dev-titles">
                <span className="dev-badge">AI Software Engineer</span>
              </div>
            </div>

            <div className="dev-main">
              <div className="dev-bio-section">
                <h3>The Vision</h3>
                <p className="dev-bio">
                  Specialized in building high-performance AI-driven applications and modern, scalable e-commerce solutions.
                  Focused on delivering premium user experiences through clean code and innovative architecture.
                </p>
                <div className="dev-socials">
                  <a href="#" className="social-link" title="Github"><GithubIcon size={22} /></a>
                  <a href="#" className="social-link" title="Twitter"><TwitterIcon size={22} /></a>
                  <a href="#" className="social-link" title="Linkedin"><LinkedinIcon size={22} /></a>
                  <a href="#" className="social-link" title="Instagram"><InstagramIcon size={22} /></a>
                </div>
              </div>

              <div className="dev-skills-section">
                <h3>Technical Expertise</h3>
                <div className="skills-grid">
                  <div className="skill-item">
                    <div className="skill-icon"><Brain size={24} /></div>
                    <span>AI & ML</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon"><Code size={24} /></div>
                    <span>Full Stack</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon"><Database size={24} /></div>
                    <span>Architecture</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon"><ShieldCheck size={24} /></div>
                    <span>Security</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon"><Award size={24} /></div>
                    <span>UI/UX</span>
                  </div>
                  <div className="skill-item">
                    <div className="skill-icon"><ShoppingBag size={24} /></div>
                    <span>E-commerce</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
