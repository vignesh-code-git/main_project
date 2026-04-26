import Link from 'next/link';
import ProductCard from '../ProductCard/ProductCard';
import './ProductSection.css';

export default function ProductSection({ title, products, viewAllHref }) {
  return (
    <section className="product-section">
      <div className="container">
        <h2>{title}</h2>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
