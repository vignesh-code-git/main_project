import { Suspense } from 'react';
import ShopPageContent from './ShopPageContent';
import { API_BASE_URL } from '@/config/api';

async function getShopData(searchParams) {
  try {
    const params = new URLSearchParams();
    if (searchParams.categoryId) params.append('categoryId', searchParams.categoryId);
    if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
    if (searchParams.color) params.append('color', searchParams.color);
    if (searchParams.style) params.append('style', searchParams.style);
    if (searchParams.size) params.append('size', searchParams.size);
    if (searchParams.search) params.append('search', searchParams.search);
    if (searchParams.brand) params.append('brand', searchParams.brand);
    
    const sortMap = {
      'Most Popular': 'rating',
      'Newest': 'newest',
      'Price: Low to High': 'price-asc',
      'Price: High to Low': 'price-desc'
    };
    const sortBy = searchParams.sortBy || 'Most Popular';
    params.append('sortBy', sortMap[sortBy] || 'newest');

    const prodRes = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`, { 
      cache: 'no-store' 
    });
    const prodData = await prodRes.json();
    
    return {
      products: prodData.products || [],
      total: prodData.total || 0
    };
  } catch (err) {
    console.error("Failed to fetch shop data:", err);
    return { products: [], total: 0 };
  }
}

export default async function ShopPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { products, total } = await getShopData(resolvedSearchParams);

  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Loading products...</div>}>
      <ShopPageContent 
        initialProducts={products} 
        initialTotal={total} 
        searchParams={resolvedSearchParams} 
      />
    </Suspense>
  );
}
