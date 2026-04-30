'use client';

import Link from 'next/link';
import './brands.css';

export default function BrandsPage() {
  const brands = [
    { name: 'VERSACE', slug: 'versace', description: 'Italian luxury fashion house.' },
    { name: 'ZARA', slug: 'zara', description: 'Spanish multi-national retail clothing chain.' },
    { name: 'GUCCI', slug: 'gucci', description: 'High-end luxury fashion brand.' },
    { name: 'PRADA', slug: 'prada', description: 'Italian luxury fashion house specializing in leather handbags.' },
    { name: 'Calvin Klein', slug: 'calvin-klein', description: 'American fashion house established in 1968.' }
  ];

  return (
    <>
      <div className="brands-container container">
        <header className="brands-header">
          <h1>Our Brands</h1>
          <p>Explore the world's most premium fashion houses all in one place.</p>
        </header>

        <div className="brands-grid">
          {brands.map((brand) => (
            <Link href={`/shop?brand=${brand.name}`} key={brand.name} className="brand-card">
              <div className="brand-name">{brand.name}</div>
              <p className="brand-desc">{brand.description}</p>
              <span className="view-collection">View Collection →</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
