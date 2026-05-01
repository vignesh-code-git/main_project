import Hero from "@/components/Hero/Hero";
import BrandBanner from "@/components/BrandBanner/BrandBanner";
import ProductSection from "@/components/ProductSection/ProductSection";
import DressStyleGallery from "@/components/DressStyleGallery/DressStyleGallery";
import Testimonials from "@/components/Testimonials/Testimonials";
import { API_BASE_URL } from '@/config/api';

async function getHomeData() {
  try {
    const [newRes, topRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/products/new-arrivals`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/api/products/top-selling`, { next: { revalidate: 3600 } })
    ]);

    const newData = await newRes.json();
    const topData = await topRes.json();

    return {
      newArrivals: newData.products || [],
      topSelling: topData.products || []
    };
  } catch (err) {
    console.error('Error fetching home data:', err);
    return { newArrivals: [], topSelling: [] };
  }
}

export default async function Home() {
  const { newArrivals, topSelling } = await getHomeData();

  return (
    <>
      <Hero />
      <BrandBanner />
      <ProductSection 
        title="NEW ARRIVALS" 
        products={newArrivals} 
        viewAllHref="/shop?newest=true" 
        loading={false} 
      />
      <ProductSection 
        title="TOP SELLING" 
        products={topSelling} 
        viewAllHref="/shop?popular=true" 
        loading={false} 
      />
      <DressStyleGallery />
      <Testimonials />
    </>
  );
}
