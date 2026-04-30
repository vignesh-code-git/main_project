import ProductDetailClient from './ProductDetailClient';

async function getProduct(id) {
  const res = await fetch(`http://localhost:5000/api/products/${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) return null;
  return res.json();
}

async function getRelatedProducts(categoryId, currentProductId) {
  const res = await fetch(`http://localhost:5000/api/products?categoryId=${categoryId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter(p => p.id !== parseInt(currentProductId)).slice(0, 4);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Product Not Found | Storefront',
    };
  }

  return {
    title: `${product.name} | Storefront`,
    description: product.description?.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return <div className="error container" style={{padding: '100px 0', textAlign: 'center'}}>Product not found.</div>;
  }

  const relatedProducts = await getRelatedProducts(product.CategoryId, id);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} id={id} />;
}
