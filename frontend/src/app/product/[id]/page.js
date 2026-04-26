'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import ProductGallery from "@/components/ProductDetail/ProductGallery";
import ProductInfo from "@/components/ProductDetail/ProductInfo";
import ReviewSection from "@/components/ProductDetail/ReviewSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import './product-detail.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) {
          setProduct(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        console.log("Fetched Product Detail Data:", data);
        setProduct(data);

        // Fetch related products (e.g. from same category)
        if (data.CategoryId) {
          const relatedRes = await fetch(`http://localhost:5000/api/products?categoryId=${data.CategoryId}`);
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData.filter(p => p.id !== parseInt(id)).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) return <div className="loading">Loading Product...</div>;
  if (!product) return <div className="error">Product not found.</div>;

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
        <ProductGallery images={product.images || []} />
        <ProductInfo product={product} />
      </section>
      <ReviewSection reviews={product.Reviews || []} />
      <ProductSection title="YOU MIGHT ALSO LIKE" products={relatedProducts} />
    </>
  );
}
