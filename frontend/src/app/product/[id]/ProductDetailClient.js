'use client';

import { useState } from 'react';
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import ProductGallery from "@/components/ProductDetail/ProductGallery";
import ProductInfo from "@/components/ProductDetail/ProductInfo";
import ReviewSection from "@/components/ProductDetail/ReviewSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import './product-detail.css';

export default function ProductDetailClient({ product, relatedProducts, id }) {
  const [selectedColor, setSelectedColor] = useState(product.color ? product.color.split(',')[0] : '');

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: product.Category?.name || 'Category', url: `/category/${product.CategoryId}` },
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
