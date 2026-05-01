import Link from 'next/link';
import './brands.css';

export default function BrandsPage() {
  const brands = [
    { name: 'VERSACE', slug: 'versace', description: 'Italian luxury fashion house.' },
    { name: 'ZARA', slug: 'zara', description: 'Spanish multi-national retail clothing chain.' },
    { name: 'GUCCI', slug: 'gucci', description: 'High-end luxury fashion brand.' },
    { name: 'PRADA', slug: 'prada', description: 'Italian luxury fashion house specializing in leather handbags.' },
    { name: 'Calvin Klein', slug: 'calvin-klein', description: 'American fashion house established in 1968.' },
    { name: 'CHANEL', slug: 'chanel', description: 'French luxury fashion house founded by Coco Chanel.' },
    { name: 'DIOR', slug: 'dior', description: 'French luxury fashion house specializing in shoes and clothing.' },
    { name: 'ARMANI', slug: 'armani', description: 'Italian luxury fashion house founded by Giorgio Armani.' }
  ];

  return (
    <div className="brands-page">
      <div className="brands-container container">
        <header className="brands-header">
          <h1>OUR PARTNER BRANDS</h1>
          <p>Discover the world's most iconic fashion houses, curated exclusively for you.</p>
        </header>

        <div className="brands-grid">
          {brands.map((brand) => (
            <Link href={`/shop?brand=${brand.name}`} key={brand.slug} className="brand-card">
              <div className="brand-content">
                <h2 className="brand-name">{brand.name}</h2>
                <p className="brand-desc">{brand.description}</p>
                <div className="brand-footer">
                  <span className="view-collection">EXPLORE COLLECTION</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
