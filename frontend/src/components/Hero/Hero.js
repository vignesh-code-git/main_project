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
  const [wordIndex, setWordIndex] = useState(0); // 0: VIBE, 1: LOOK, 2: STYLE
  const [descProgress, setDescProgress] = useState(0); // 0 to 1 for gradient wipe
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameCount = 140;

  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const isLockedRef = useRef(true);
  const layoutMetrics = useRef({ totalScrollHeight: 0, canvasWidth: 0, canvasHeight: 0 });

  // Guaranteed Loader Exit
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      const hideTimer = setTimeout(() => {
        setPreloading(false);
        isLockedRef.current = false;
      }, 1000);
      return () => clearTimeout(hideTimer);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Main Hero Animation logic
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    // --- ROBUST DETECTION ---
    const checkIsMobile = () => {
      if (typeof window === 'undefined') return false;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      return (
        window.innerWidth <= 1024 ||
        window.matchMedia('(max-width: 1024px)').matches ||
        isTouch ||
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      );
    };

    // --- SESSION STABILITY LOCKS ---
    // We lock these on the very first mount to prevent jumps when the browser's 
    // address bar or header resizes the layout.
    const sessionMetricsRef = {
      current: typeof window !== 'undefined' ? {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: checkIsMobile()
      } : { width: 0, height: 0, isMobile: false }
    };

    const isMobileRef = { current: sessionMetricsRef.current.isMobile };
    const scaleRef = { current: isMobileRef.current ? 1.25 : 1.28 };
    const hasVerifiedRef = { current: false };

    const targetFrameRef = { current: 1 };
    const currentFrameRef = { current: 1 };
    const animationFrameRef = { current: null };

    // --- HOISTED FUNCTIONS ---
    function updateCanvas(index) {
      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      if (!canvas || !offscreen) return;

      const context = canvas.getContext('2d', { alpha: false });
      const offContext = offscreen.getContext('2d', { alpha: false });

      let img = null;
      for (let i = index; i >= 1; i--) {
        const check = imagesRef.current[i];
        if (check && check.complete && check.naturalWidth !== 0) {
          img = check;
          break;
        }
      }

      if (img) {
        // Use session-locked metrics to prevent jumps during layout settling
        const session = sessionMetricsRef.current;
        const { canvasWidth, canvasHeight } = layoutMetrics.current;

        if (offscreen.width !== canvasWidth || offscreen.height !== canvasHeight) {
          offscreen.width = canvasWidth;
          offscreen.height = canvasHeight;
        }

        offContext.fillStyle = '#F2F0F1';
        offContext.fillRect(0, 0, offscreen.width, offscreen.height);

        const dpr = window.devicePixelRatio || 1;
        // Ensure we never have a 0 base for calculations
        const baseWidth = (isMobileRef.current && session.width > 0) ? (session.width * dpr) : offscreen.width;
        const baseHeight = (isMobileRef.current && session.height > 0) ? (session.height * dpr) : offscreen.height;
        
        const canvasAspect = baseWidth / baseHeight;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasAspect > imgAspect) {
          drawHeight = baseHeight * scaleRef.current;
          drawWidth = drawHeight * imgAspect;
        } else {
          drawWidth = baseWidth * scaleRef.current;
          drawHeight = drawWidth / imgAspect;
        }

        if (isMobileRef.current) {
          // Use offscreen dimensions for centering to guarantee visibility, 
          // while drawWidth/Height remain stable.
          offsetX = ((offscreen.width - drawWidth) / 2) - (offscreen.width * 0.15);
          offsetY = ((offscreen.height - drawHeight) / 2) + (offscreen.height * 0.05);
        } else {
          offsetX = ((offscreen.width - drawWidth) / 2);
          offsetY = (offscreen.height - drawHeight) / 2 + (offscreen.height * 0.10);
        }

        offContext.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        context.drawImage(offscreen, 0, 0);
      }
    }

    function smoothAnimate() {
      const diff = targetFrameRef.current - currentFrameRef.current;
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
    }

    function handleScroll() {
      if (!containerRef.current) return;

      // Verification Check: On the very first scroll, double check if we correctly detected mobile.
      // This prevents the "large then small" jump if innerWidth was reported wrong at mount.
      if (!hasVerifiedRef.current) {
        const actualIsMobile = checkIsMobile();
        if (actualIsMobile !== isMobileRef.current) {
          isMobileRef.current = actualIsMobile;
          scaleRef.current = actualIsMobile ? 1.25 : 1.28;
          handleResize(); // Force re-calculation with correct scale
        }
        hasVerifiedRef.current = true;
      }

      const container = containerRef.current;
      const stickyTop = 110;
      const startPoint = container.offsetTop - stickyTop;
      const totalStickySpace = container.offsetHeight - (window.innerHeight - stickyTop);
      const currentScroll = window.scrollY;
      const scrolledDistance = Math.max(0, currentScroll - startPoint);

      const flipperRatio = 0.22;
      const flipperLimit = totalStickySpace * flipperRatio;

      let newWordIndex = 0;
      if (scrolledDistance <= flipperLimit) {
        const textProgress = scrolledDistance / flipperLimit;
        if (textProgress < 0.10) newWordIndex = 0;
        else if (textProgress < 0.55) newWordIndex = 1;
        else newWordIndex = 2;
      } else {
        newWordIndex = 2;
      }
      setWordIndex(prev => prev !== newWordIndex ? newWordIndex : prev);

      if (scrolledDistance <= flipperLimit) {
        setDescProgress(0);
        targetFrameRef.current = 1;
        currentFrameRef.current = 1;
        updateCanvas(1);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      const stayRatio = 0.24;
      const stayLimit = totalStickySpace * stayRatio;
      if (scrolledDistance <= stayLimit) {
        setDescProgress(0);
        targetFrameRef.current = 1;
        currentFrameRef.current = 1;
        updateCanvas(1);
        return;
      }

      const descRatio = 0.50;
      const descLimit = totalStickySpace * descRatio;
      if (scrolledDistance <= descLimit) {
        const progress = (scrolledDistance - stayLimit) / (descLimit - stayLimit);
        setDescProgress(progress);
        targetFrameRef.current = 1;
        currentFrameRef.current = 1;
        updateCanvas(1);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      setDescProgress(1);
      const imageScrolledDistance = scrolledDistance - descLimit;
      const imageZoneSpace = totalStickySpace - descLimit;
      const midBuffer = imageZoneSpace * 0.05;

      if (imageScrolledDistance <= midBuffer) {
        targetFrameRef.current = 1;
        updateCanvas(1);
        return;
      }

      const activeImageDistance = imageScrolledDistance - midBuffer;
      const activeImageRange = imageZoneSpace - midBuffer;
      const animationBuffer = activeImageRange * 0.95;

      if (activeImageDistance >= animationBuffer) {
        targetFrameRef.current = frameCount;
        currentFrameRef.current = frameCount;
        updateCanvas(frameCount);
        return;
      }

      const scrollFraction = Math.max(0, Math.min(activeImageDistance / animationBuffer, 1));
      const frameIndex = Math.max(1, Math.min(frameCount, Math.floor(scrollFraction * (frameCount - 1)) + 1));

      targetFrameRef.current = frameIndex;
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(smoothAnimate);
      }
    }

    function handleResize() {
      if (!containerRef.current || !canvasRef.current) return;

      // Continuous verification: Update detection on every resize/rotation
      const actualIsMobile = checkIsMobile();
      if (actualIsMobile !== isMobileRef.current) {
        isMobileRef.current = actualIsMobile;
        scaleRef.current = actualIsMobile ? 1.25 : 1.28;
      }

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

      const context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = '#F2F0F1';
      context.fillRect(0, 0, canvas.width, canvas.height);

      updateCanvas(Math.round(currentFrameRef.current));
    }

    // Populate dimensions immediately to ensure scroll animation is ready
    handleResize();
    handleScroll();

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
          img.onerror = () => resolve();
          img.src = `/images/hero-animation/ezgif-frame-${frameNum}_Compressed.webp`;
          imagesRef.current[i] = img;
        });
      };

      await loadFrame(1);

      // Kickstart canvas with first frame
      updateCanvas(1);
      handleScroll();

      setFadeOut(true);
      setTimeout(() => setPreloading(false), 800);

      const initialBatch = [];
      for (let i = 2; i <= Math.min(15, frameCount); i++) initialBatch.push(loadFrame(i));
      await Promise.all(initialBatch);

      const roughBatch = [];
      for (let i = 20; i <= frameCount; i += 5) roughBatch.push(loadFrame(i));
      await Promise.all(roughBatch);

      const remainingFrames = [];
      for (let i = 1; i <= frameCount; i++) if (!imagesRef.current[i]) remainingFrames.push(i);
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

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
            <h1 className="hero-title animate-text">
              FIND CLOTHES <br />THAT MATCHES <br />
              <span className="hero-last-line">
                YOUR{' '}
                <span className="word-flipper-container">
                  <span className="word-flipper" style={{ transform: `translateY(-${wordIndex * 1.1}em)` }}>
                    <span className="text-vibe">VIBE</span>
                    <span className="text-look">LOOK</span>
                    <span className="text-style">STYLE</span>
                  </span>
                </span>
              </span>
            </h1>
            <div className="hero-description-container">
              <p className="hero-description animate-text">
                <span className="desktop-tablet-only">
                  Browse through our diverse range of meticulously crafted garments, designed <br className="desktop-tablet-only" />
                  to bring out your individuality and cater to your sense of style.
                </span>
                <span className="phone-only">
                  Browse our diverse range of meticulously crafted garments, designed
                  to bring out your unique individuality and style.
                </span>
              </p>
              <p
                className="hero-description gradient-overlay animate-text"
                style={{ clipPath: `polygon(0% 0%, ${descProgress * 105}% 0%, ${descProgress * 105 - 5}% 100%, 0% 100%)` }}
              >
                <span className="desktop-tablet-only">
                  Browse through our diverse range of meticulously crafted garments, designed <br className="desktop-tablet-only" />
                  to bring out your individuality and cater to your sense of style.
                </span>
                <span className="phone-only">
                  Browse our diverse range of meticulously crafted garments, designed
                  to bring out your unique individuality and style.
                </span>
              </p>
            </div>
            <button className="shop-now-btn animate-text">Shop Now</button>

            <div className="hero-stats-container">
              <div className="hero-stats animate-text">
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

              <div
                className="hero-stats gradient-overlay animate-text"
                style={{ clipPath: `polygon(0% 0%, ${descProgress * 105}% 0%, ${descProgress * 105 - 5}% 100%, 0% 100%)` }}
              >
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
