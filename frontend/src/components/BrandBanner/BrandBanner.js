import './BrandBanner.css';

export default function BrandBanner() {
  const brands = [
    { name: 'VERSACE', className: 'brand-versace' },
    { name: 'ZARA', className: 'brand-zara' },
    { name: 'GUCCI', className: 'brand-gucci' },
    { name: 'PRADA', className: 'brand-prada' },
    { name: 'Calvin Klein', className: 'brand-ck' }
  ];

  return (
    <section className="brand-banner" id="brands">
      <div className="container brand-container">
        {brands.map((brand, index) => (
          <span key={index} className={`brand-name ${brand.className}`}>{brand.name}</span>
        ))}
      </div>
    </section>
  );
}
