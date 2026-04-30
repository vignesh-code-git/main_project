import Link from 'next/link';
import ProductCard from '../ProductCard/ProductCard';
import ProductCardSkeleton from '../Skeleton/ProductCardSkeleton';
import './ProductSection.css';

export default function ProductSection({ title, products, viewAllHref, loading }) {
  return (
    <section className="product-section">
      <div className="container">
        <h2>{title}</h2>
        <div className="product-grid">
          {loading || !products || products.length === 0 ? (
            [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
        <div className="view-all-container">
          {viewAllHref && (
            <Link href={viewAllHref} className="view-all-btn">View All</Link>
          )}
        </div>
      </div>
    </section>
  );
}
