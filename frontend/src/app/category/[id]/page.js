import { Suspense } from 'react';
import CategoryPageContent from './CategoryPageContent';
import { API_BASE_URL } from '@/config/api';

async function getCategoryData(id, searchParams) {
  try {
    let endpoint = `${API_BASE_URL}/api/products`;
    const params = new URLSearchParams();
    const styles = ['casual', 'formal', 'party', 'gym'];
    let categoryName = 'Category';

    if (id === 'new-arrivals') {
      endpoint = `${API_BASE_URL}/api/products/new-arrivals`;
      categoryName = 'New Arrivals';
    } else if (id === 'top-selling') {
      endpoint = `${API_BASE_URL}/api/products/top-selling`;
      categoryName = 'Top Selling';
    } else if (id === 'on-sale') {
      params.append('onSale', 'true');
      categoryName = 'On Sale';
    } else if (styles.includes(id.toLowerCase())) {
      params.append('style', id.charAt(0).toUpperCase() + id.slice(1));
      categoryName = id.charAt(0).toUpperCase() + id.slice(1);
    } else {
      params.append('categoryId', id);
      // Fetch category details
      const catRes = await fetch(`${API_BASE_URL}/api/products/categories`);
      const catData = await catRes.json();
      const currentCat = catData.find(c => c.id === parseInt(id));
      if (currentCat) categoryName = currentCat.name;
    }

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

    const prodRes = await fetch(`${endpoint}?${params.toString()}`, { cache: 'no-store' });
    const prodData = await prodRes.json();
    
    let products = [];
    let total = 0;

    if (prodData.products) {
      products = prodData.products;
      total = prodData.total || prodData.products.length;
    } else {
      products = Array.isArray(prodData) ? prodData : [];
      total = products.length;
    }

    return { products, total, categoryName };
  } catch (err) {
    console.error("Failed to fetch category data:", err);
    return { products: [], total: 0, categoryName: 'Category' };
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { products, total, categoryName } = await getCategoryData(resolvedParams.id, resolvedSearchParams);

  return (
    <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center'}}>Loading products...</div>}>
      <CategoryPageContent 
        id={resolvedParams.id}
        categoryName={categoryName}
        initialProducts={products}
        initialTotal={total}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}
