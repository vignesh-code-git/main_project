import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
import ProductGallery from "@/components/ProductDetail/ProductGallery";
import ProductInfo from "@/components/ProductDetail/ProductInfo";
import ReviewSection from "@/components/ProductDetail/ReviewSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import './product-detail.css';

export default function ProductDetailPage() {
  const product = {
    id: 1,
    name: "ONE LIFE GRAPHIC T-SHIRT",
    price: 260,
    originalPrice: 300,
    rating: 4.5,
    description: "This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.",
    images: [1, 2, 3], // mock image ids
  };

  const relatedProducts = [
    { id: 5, name: "Polo with Contrast Trims", price: 212, originalPrice: 242, rating: 4.0 },
    { id: 6, name: "Gradient Graphic T-shirt", price: 145, rating: 3.5 },
    { id: 7, name: "Polo with Tipping Details", price: 180, rating: 4.5 },
    { id: 8, name: "Black Striped T-shirt", price: 120, originalPrice: 150, rating: 5.0 },
  ];

  const breadcrumbPaths = [
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: 'Men', url: '/shop/men' },
    { name: 'T-shirts', url: '/shop/men/t-shirts' },
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
