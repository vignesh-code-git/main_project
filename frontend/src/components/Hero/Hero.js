'use client';

import { useState, useEffect, useRef } from 'react';
import './Hero.css';

export default function Hero() {
  const [stats, setStats] = useState({ brands: '0+', products: '0+', customers: '0+' });
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameCount = 240;

  const containerRef = useRef(null);
  const heroContentRef = useRef(null);

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
    const targetFrameRef = { current: 1 };
    const currentFrameRef = { current: 1 };
    const animationFrameRef = { current: null };

    // Smooth lerp animation loop
    const smoothAnimate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;

      // If the difference is significant, interpolate
      if (Math.abs(diff) > 0.1) {
        currentFrameRef.current += diff * 0.1; // Smoothness factor
        const frameIndex = Math.round(currentFrameRef.current);
        updateCanvas(frameIndex);
        animationFrameRef.current = requestAnimationFrame(smoothAnimate);
      } else {
        currentFrameRef.current = targetFrameRef.current;
        const frameIndex = Math.round(currentFrameRef.current);
        updateCanvas(frameIndex);
        animationFrameRef.current = null;
      }
    };

    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const totalScrollableHeight = container.offsetHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      const scrollFraction = Math.max(0, Math.min(currentScroll / totalScrollableHeight, 1));
      const frameIndex = Math.max(1, Math.min(frameCount, Math.floor(scrollFraction * (frameCount - 1)) + 1));

      targetFrameRef.current = frameIndex;

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(smoothAnimate);
      }
    };

    const updateCanvas = (index) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      const img = imagesRef.current[index];

      if (img && img.complete) {
        const dpr = window.devicePixelRatio || 1;
        if (canvas.width !== canvas.offsetWidth * dpr || canvas.height !== canvas.offsetHeight * dpr) {
          canvas.width = canvas.offsetWidth * dpr;
          canvas.height = canvas.offsetHeight * dpr;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const headerHeight = 0; // Removed internal clearance to put it up
        const visibleHeight = canvas.height - (headerHeight * dpr);
        const canvasAspect = canvas.width / visibleHeight;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        const scale = 1.28;
        if (canvasAspect > imgAspect) {
          drawHeight = visibleHeight * scale;
          drawWidth = drawHeight * imgAspect;
        } else {
          drawWidth = canvas.width * scale;
          drawHeight = drawWidth / imgAspect;
        }

        // Center horizontally with a small right-shift (5%), and maintain downward offset (10%)
        offsetX = ((canvas.width - drawWidth) / 2) + (canvas.width * 0.05);
        offsetY = (headerHeight * dpr) + (visibleHeight - drawHeight) / 2 + (canvas.height * 0.10);

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    const firstImg = new Image();
    firstImg.src = '/images/hero-animation/ezgif-frame-001.png';
    firstImg.onload = () => {
      updateCanvas(1);
    };

    window.addEventListener('scroll', handleScroll);
    const handleResize = () => handleScroll();

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="hero-sticky-wrapper" ref={containerRef}>
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content" ref={heroContentRef}>
            <h1>FIND CLOTHES<br />THAT MATCHES<br />YOUR STYLE</h1>
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
        <div className="star star-large star-large-right">✦</div>
        <div className="star star-small star-large-middle">✦</div>
      </section>
    </div>
  );
}
