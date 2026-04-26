'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './DressStyleGallery.css';

export default function DressStyleGallery() {
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();

    // Listen for real-time updates from Admin Panel
    const channel = new BroadcastChannel('admin_settings_update');
    channel.onmessage = () => {
      fetchSettings();
    };
    return () => channel.close();
  }, []);

  const getStyleImage = (slug) => {
    const setting = settings.find(s => s.key === `style_${slug}`);
    return setting ? `http://localhost:5000${setting.value}` : null;
  };

  const styles = [
    { name: 'Casual', className: 'style-casual', slug: 'casual' },
    { name: 'Formal', className: 'style-formal', slug: 'formal' },
    { name: 'Party', className: 'style-party', slug: 'party' },
    { name: 'Gym', className: 'style-gym', slug: 'gym' },
  ];

  return (
    <section className="dress-style-gallery container">
      <div className="gallery-card">
        <h2>BROWSE BY DRESS STYLE</h2>
        <div className="gallery-grid">
          {styles.map((style, index) => (
            <Link
              key={index}
              href={`/category/${style.slug}`}
              className={`style-item ${style.className}`}
            >
              <h3>{style.name}</h3>
              {getStyleImage(style.slug) && (
                <img
                  src={getStyleImage(style.slug)}
                  alt={style.name}
                  className="style-item-img"
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
