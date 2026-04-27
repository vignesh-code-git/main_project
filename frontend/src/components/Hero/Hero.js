'use client';

import { useState, useEffect, useRef } from 'react';
import './Hero.css';

export default function Hero() {
  const [stats, setStats] = useState({ brands: '0+', products: '0+', customers: '0+' });
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameCount = 240;

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `/images/hero-animation/ezgif-frame-${frameNum}.png`;
        imagesRef.current[i] = img;
      }
    };

    preloadImages();

    const fetchHeroData = async () => {
      try {
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

    // Scroll Animation Logic
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sectionHeight = canvasRef.current?.parentElement?.offsetHeight || 800;
      // Animation plays over a certain scroll distance (e.g., 800px or section height)
      const maxScroll = Math.max(sectionHeight, 800); 
      const scrollFraction = Math.min(scrollY / maxScroll, 1);
      const frameIndex = Math.max(1, Math.min(frameCount, Math.floor(scrollFraction * frameCount)));

      requestAnimationFrame(() => updateCanvas(frameIndex));
    };

    const updateCanvas = (index) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      const img = imagesRef.current[index];

      if (img && img.complete) {
        // Handle High DPI displays
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== canvas.offsetWidth * dpr || canvas.height !== canvas.offsetHeight * dpr) {
          canvas.width = canvas.offsetWidth * dpr;
          canvas.height = canvas.offsetHeight * dpr;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgAspect;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    // Preload first frame and draw
    const firstImg = new Image();
    firstImg.src = '/images/hero-animation/ezgif-frame-001.png';
    firstImg.onload = () => {
      updateCanvas(1);
    };

    window.addEventListener('scroll', handleScroll);
    
    const handleResize = () => {
      handleScroll(); 
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
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
        <canvas 
          ref={canvasRef} 
          className="hero-animation-canvas"
        />
      </div>
      <div className="star star-large">✦</div>
      <div className="star star-small">✦</div>
    </section>
  );
}
