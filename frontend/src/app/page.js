'use client';

import { useState, useEffect } from 'react';
import Hero from "@/components/Hero/Hero";
import BrandBanner from "@/components/BrandBanner/BrandBanner";
import ProductSection from "@/components/ProductSection/ProductSection";
import DressStyleGallery from "@/components/DressStyleGallery/DressStyleGallery";
import Testimonials from "@/components/Testimonials/Testimonials";

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [newRes, topRes] = await Promise.all([
          fetch('http://localhost:5000/api/products/new-arrivals', { cache: 'no-store' }),
          fetch('http://localhost:5000/api/products/top-selling', { cache: 'no-store' })
        ]);

        const newData = await newRes.json();
        const topData = await topRes.json();

        setNewArrivals(newData.products || []);
        setTopSelling(topData.products || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <Hero />
      <BrandBanner />
      <ProductSection title="NEW ARRIVALS" products={newArrivals} viewAllHref="/category/new-arrivals" loading={loading} />
      <ProductSection title="TOP SELLING" products={topSelling} viewAllHref="/category/top-selling" loading={loading} />
      <DressStyleGallery />
      <Testimonials />
    </>
  );
}
