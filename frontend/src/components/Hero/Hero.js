'use client';

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/config/api';
import Skeleton from '../Skeleton/Skeleton';
import './Hero.css';

export default function Hero() {
  const [stats, setStats] = useState({ brands: '0+', products: '0+', customers: '0+' });
  const [loading, setLoading] = useState(true);
  const [preloading, setPreloading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameCount = 240;

  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const layoutMetrics = useRef({ totalScrollHeight: 0, canvasWidth: 0, canvasHeight: 0 });

  // Preload images
  useEffect(() => {
    // Create offscreen canvas for double buffering
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const preloadImages = async () => {
      let loadedCount = 0;
      const batchSize = 10; // Load in small batches to not choke the network

      for (let i = 1; i <= frameCount; i += batchSize) {
        const promises = [];
        for (let j = 0; j < batchSize && (i + j) <= frameCount; j++) {
          const frameNum = String(i + j).padStart(3, '0');
          const img = new Image();
          const promise = new Promise((resolve) => {
            img.onload = () => {
              loadedCount++;
              setLoadProgress(Math.floor((loadedCount / frameCount) * 100));
              resolve();
            };
            img.onerror = resolve; // Continue even if one fails
            img.src = `/images/hero-animation/ezgif-frame-${frameNum}.png`;
          });
          imagesRef.current[i + j] = img;
          promises.push(promise);
        }
        await Promise.all(promises);
      }
      setPreloading(false);
      // Ensure the first frame is drawn immediately after preloading
      updateCanvas(1);
      // Allow for a smooth fade out
      setTimeout(() => setOverlayVisible(false), 500);
    };

    preloadImages();

    const fetchHeroData = async () => {
      try {
        const statsRes = await fetch(`${API_BASE_URL}/api/products/stats`);
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
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();

    // Scroll Animation Logic
    const targetFrameRef = { current: 1 };
    const currentFrameRef = { current: 1 };
    const animationFrameRef = { current: null };

    const updateCanvas = (index) => {
      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      if (!canvas || !offscreen) return;

      const context = canvas.getContext('2d', { alpha: false });
      const offContext = offscreen.getContext('2d', { alpha: false });
      const img = imagesRef.current[index];

      if (img && img.complete) {
        const { canvasWidth, canvasHeight } = layoutMetrics.current;
        const dpr = window.devicePixelRatio || 1;

        if (offscreen.width !== canvasWidth || offscreen.height !== canvasHeight) {
          offscreen.width = canvasWidth;
          offscreen.height = canvasHeight;
        }

        // Draw to offscreen buffer first
        offContext.fillStyle = '#F2F0F1';
        offContext.fillRect(0, 0, offscreen.width, offscreen.height);

        const visibleHeight = offscreen.height;
        const canvasAspect = offscreen.width / visibleHeight;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        const isMobile = window.innerWidth <= 1024;
        const scale = isMobile ? 1.5 : 1.28;

        if (canvasAspect > imgAspect) {
          drawHeight = visibleHeight * scale;
          drawWidth = drawHeight * imgAspect;
        } else {
          drawWidth = offscreen.width * scale;
          drawHeight = drawWidth / imgAspect;
        }

        if (isMobile) {
          offsetX = ((offscreen.width - drawWidth) / 2) - (offscreen.width * 0.17);
          offsetY = ((visibleHeight - drawHeight) / 2) + (offscreen.height * 0.06);
        } else {
          offsetX = ((offscreen.width - drawWidth) / 2);
          offsetY = (visibleHeight - drawHeight) / 2 + (offscreen.height * 0.10);
        }

        offContext.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Final swap to visible canvas
        context.drawImage(offscreen, 0, 0);
      } else {
        // Fallback: fill visible canvas with theme color if image not ready
        const context = canvas.getContext('2d', { alpha: false });
        context.fillStyle = '#F2F0F1';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    const smoothAnimate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;

      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * 0.15;
        updateCanvas(Math.round(currentFrameRef.current));
        animationFrameRef.current = requestAnimationFrame(smoothAnimate);
      } else {
        currentFrameRef.current = targetFrameRef.current;
        updateCanvas(Math.round(currentFrameRef.current));
        animationFrameRef.current = null;
      }
    };

    const handleScroll = () => {
      const { totalScrollHeight } = layoutMetrics.current;
      if (totalScrollHeight <= 0) return;

      const currentScroll = window.scrollY;
      const scrollFraction = Math.max(0, Math.min(currentScroll / totalScrollHeight, 1));
      const frameIndex = Math.max(1, Math.min(frameCount, Math.floor(scrollFraction * (frameCount - 1)) + 1));

      targetFrameRef.current = frameIndex;
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(smoothAnimate);
      }
    };

    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const container = containerRef.current;
      const canvas = canvasRef.current;

      layoutMetrics.current = {
        totalScrollHeight: container.offsetHeight - window.innerHeight,
        canvasWidth: canvas.offsetWidth * dpr,
        canvasHeight: canvas.offsetHeight * dpr
      };

      canvas.width = layoutMetrics.current.canvasWidth;
      canvas.height = layoutMetrics.current.canvasHeight;

      // Fill with theme color immediately to prevent black flash
      const context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = '#F2F0F1';
      context.fillRect(0, 0, canvas.width, canvas.height);

      updateCanvas(Math.round(currentFrameRef.current));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initial setup
    handleResize();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="hero-sticky-wrapper" ref={containerRef}>
      {overlayVisible && (
        <div className={`hero-loading-overlay ${!preloading ? 'fade-out' : ''}`}>
          <div className="loader-content">
            <div className="spinner"></div>
            <p>Loading Experience {loadProgress}%</p>
          </div>
        </div>
      )}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content" ref={heroContentRef}>
            <h1 className="hero-title">FIND CLOTHES <span className="hide-mobile"><br /></span>THAT MATCHES <span className="hide-mobile"><br /></span>YOUR STYLE</h1>
            <p className="hero-description">
              Browse through our diverse range of meticulously crafted garments, designed <br />
              to bring out your individuality and cater to your sense of style.
            </p>










            <button className="shop-now-btn">Shop Now</button>

            <div className="hero-stats">
              <div className="stat-item">
                {loading ? <Skeleton width="100px" height="40px" /> : <h2>{stats.brands}</h2>}
                <p>International Brands</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                {loading ? <Skeleton width="120px" height="40px" /> : <h2>{stats.products}</h2>}
                <p>High-Quality Products</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                {loading ? <Skeleton width="100px" height="40px" /> : <h2>{stats.customers}</h2>}
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

          <span className="star star-large star-large-middle">✦</span>



        </div>
      </section>
    </div>
  );
}

