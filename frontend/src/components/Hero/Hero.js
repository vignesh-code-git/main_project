'use client';

import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/config/api';
import Skeleton from '../Skeleton/Skeleton';
import './Hero.css';

export default function Hero() {
  const [stats, setStats] = useState({ brands: '0+', products: '0+', customers: '0+' });
  const [loading, setLoading] = useState(true);
  const [preloading, setPreloading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameCount = 140;

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
      const loadFrame = (i) => {
        return new Promise((resolve) => {
          if (imagesRef.current[i]) return resolve();
          const frameNum = String(i).padStart(3, '0');
          const img = new Image();
          img.onload = () => {
            if (i === 1) updateCanvas(1);
            resolve();
          };
          img.onerror = resolve;
          img.src = `/images/hero-animation/ezgif-frame-${frameNum}_Compressed.webp`;
          imagesRef.current[i] = img;
        });
      };

      // Phase 1: Instant - First frame only
      await loadFrame(1);

      // Hide loader early with a smooth reveal
      setFadeOut(true);
      setTimeout(() => {
        setPreloading(false);
      }, 1200);

      // Phase 2: Smooth Start
      const initialBatch = [];
      for (let i = 2; i <= Math.min(15, frameCount); i++) {
        initialBatch.push(loadFrame(i));
      }
      await Promise.all(initialBatch);

      // Phase 3: Rough Sequence
      const roughBatch = [];
      for (let i = 20; i <= frameCount; i += 5) {
        roughBatch.push(loadFrame(i));
      }
      await Promise.all(roughBatch);

      // Phase 4: Final Polish
      const remainingFrames = [];
      for (let i = 1; i <= frameCount; i++) {
        if (!imagesRef.current[i]) remainingFrames.push(i);
      }

      for (let i = 0; i < remainingFrames.length; i += 10) {
        const chunk = remainingFrames.slice(i, i + 10);
        await Promise.all(chunk.map(frame => loadFrame(frame)));
      }
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

      // STICKY FRAME LOGIC: Never show white space. 
      // If the frame isn't ready, find the closest one that is.
      let img = null;
      for (let i = index; i >= 1; i--) {
        const check = imagesRef.current[i];
        if (check && check.complete && check.naturalWidth !== 0) {
          img = check;
          break;
        }
      }

      if (img) {
        const { canvasWidth, canvasHeight } = layoutMetrics.current;

        if (offscreen.width !== canvasWidth || offscreen.height !== canvasHeight) {
          offscreen.width = canvasWidth;
          offscreen.height = canvasHeight;
        }

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
        context.drawImage(offscreen, 0, 0);
      }
    };

    const smoothAnimate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;

      // If we are at the very end or start, snap faster to prevent "lagging" behind the scroll
      const isNearEnd = targetFrameRef.current > frameCount * 0.98 || targetFrameRef.current < 2;
      const lerpFactor = isNearEnd ? 0.4 : 0.15;

      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * lerpFactor;
        updateCanvas(Math.round(currentFrameRef.current));
        animationFrameRef.current = requestAnimationFrame(smoothAnimate);
      } else {
        currentFrameRef.current = targetFrameRef.current;
        updateCanvas(Math.round(currentFrameRef.current));
        animationFrameRef.current = null;
      }
    };

    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const stickyTop = 110;

      // Calculate the scroll point where the hero section becomes sticky
      const startPoint = container.offsetTop - stickyTop;
      // Calculate the total distance the user scrolls while the hero is sticky
      const totalStickySpace = container.offsetHeight - (window.innerHeight - stickyTop);

      const currentScroll = window.scrollY;
      const scrolledDistance = currentScroll - startPoint;

      // BUFFER: Reach frame 140 early (at 90% of the scroll)
      const bufferPercent = 0.90;
      const animationRange = totalStickySpace * bufferPercent;

      if (scrolledDistance >= animationRange) {
        targetFrameRef.current = frameCount;
        currentFrameRef.current = frameCount;
        updateCanvas(frameCount);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      const scrollFraction = Math.max(0, Math.min(scrolledDistance / animationRange, 1));
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
      {preloading && (
        <div className={`hero-loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
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
