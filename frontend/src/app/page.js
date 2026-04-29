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

  useEffect(() => {
    // Fetch New Arrivals
    fetch('http://localhost:5000/api/products/new-arrivals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNewArrivals(data);
        else console.error('Expected array for new arrivals:', data);
      })
      .catch(err => console.error('Error fetching new arrivals:', err));

    // Fetch Top Selling
    fetch('http://localhost:5000/api/products/top-selling')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTopSelling(data);
        else console.error('Expected array for top selling:', data);
      })
      .catch(err => console.error('Error fetching top selling:', err));
  }, []);

  return (
    <>
      <Hero />
      <BrandBanner />
      <ProductSection title="NEW ARRIVALS" products={newArrivals} viewAllHref="/category/new-arrivals" />
      <ProductSection title="TOP SELLING" products={topSelling} viewAllHref="/category/top-selling" />
      <DressStyleGallery />
      <Testimonials />
    </>
  );
}
