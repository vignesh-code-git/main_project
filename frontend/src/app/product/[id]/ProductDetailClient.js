'use client';

import { useState, useEffect } from 'react';
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import ProductGallery from "@/components/ProductDetail/ProductGallery";
import ProductInfo from "@/components/ProductDetail/ProductInfo";
import ReviewSection from "@/components/ProductDetail/ReviewSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import './product-detail.css';

export default function ProductDetailClient({ product, relatedProducts, id }) {
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (product.color) {
      const colors = product.color.split(',').map(c => c.trim());
      if (colors.length > 0 && (!selectedColor || !colors.includes(selectedColor))) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product.id, product.color]);

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: product.Category?.name || 'Category', url: `/category/${product.categoryId}` },
    { name: product.name, url: '#' },
  ];

  return (
    <>
      <Breadcrumbs paths={breadcrumbPaths} />
      <section className="product-detail-main container">
        <ProductGallery images={product.images || []} selectedColor={selectedColor} />
        <ProductInfo product={product} selectedColor={selectedColor} setSelectedColor={setSelectedColor} />
      </section>
      <ReviewSection productId={product.id} />
      <ProductSection title="YOU MIGHT ALSO LIKE" products={relatedProducts} />
    </>
  );
}
