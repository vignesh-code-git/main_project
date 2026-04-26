'use client';

import { useState, useEffect } from 'react';
import './Hero.css';

export default function Hero() {
  const [heroImg, setHeroImg] = useState(null);
  const [stats, setStats] = useState({ brands: '0+', products: '0+', customers: '0+' });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        // Fetch hero background
        const settingsRes = await fetch('http://localhost:5000/api/admin/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (Array.isArray(settingsData)) {
            const setting = settingsData.find(s => s.key === 'hero_bg');
            if (setting) {
              setHeroImg(`http://localhost:5000${setting.value}`);
            }
          }
        }

        // Fetch stats
        const statsRes = await fetch('http://localhost:5000/api/products/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData && typeof statsData.products !== 'undefined') {
            setStats({
              brands: `${statsData.brands || 0}+`,
              products: `${(statsData.products || 0).toLocaleString()}+`,
              customers: `${(statsData.customers || 0).toLocaleString()}+`
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch hero data:", err);
      }
    };

    fetchHeroData();

    // Listen for real-time updates from Admin Panel
    const channel = new BroadcastChannel('admin_settings_update');
    channel.onmessage = () => {
      fetchHeroData();
    };
    return () => channel.close();
  }, []);

  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content">
          <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>
          <p>
            Browse through our diverse range of meticulously crafted garments, designed<br />
            to bring out your individuality and cater to your sense of style.
          </p>
          <button className="shop-now-btn">Shop Now</button>

          <div className="hero-stats">
            <div className="stat-item">
              <h2>{stats.brands}</h2>
              <p>International Brands</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h2>{stats.products}</h2>
              <p>High-Quality Products</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h2>{stats.customers}</h2>
              <p>Happy Customers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-image-wrapper">
        {heroImg && (
          <img
            src={heroImg}
            alt="Fashion Models"
            className="hero-main-img"
          />
        )}
      </div>
      <div className="star star-large">✦</div>
      <div className="star star-small">✦</div>
    </section>
  );
}
