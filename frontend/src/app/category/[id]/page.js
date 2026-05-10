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
      params.append('sortBy', 'newest');
      categoryName = 'New Arrivals';
    } else if (id === 'top-selling') {
      endpoint = `${API_BASE_URL}/api/products/top-selling`;
      params.append('sortBy', 'oldest');
      categoryName = 'Top Selling';
    } else if (id === 'on-sale') {
      params.append('onSale', 'true');
      params.append('sortBy', 'newest');
      categoryName = 'On Sale';
    } else if (styles.includes(id.toLowerCase())) {
      params.append('style', id.charAt(0).toUpperCase() + id.slice(1));
      categoryName = id.charAt(0).toUpperCase() + id.slice(1);
    } else {
      params.append('categoryId', id);
      params.append('sortBy', 'oldest');
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
    if (searchParams.page) params.append('page', searchParams.page);

    const sortMap = {
      'Most Popular': 'popular',
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
    let totalPages = 1;
    let currentPage = 1;

    if (prodData.products) {
      products = prodData.products;
      total = prodData.total || prodData.products.length;
      totalPages = prodData.totalPages || 1;
      currentPage = prodData.currentPage || 1;
    } else {
      products = Array.isArray(prodData) ? prodData : [];
      total = products.length;
    }

    return { products, total, totalPages, currentPage, categoryName };
  } catch (err) {
    console.error("Failed to fetch category data:", err);
    return { products: [], total: 0, totalPages: 1, currentPage: 1, categoryName: 'Category' };
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { products, total, totalPages, currentPage, categoryName } = await getCategoryData(resolvedParams.id, resolvedSearchParams);

  return (
    <Suspense fallback={<div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading products...</div>}>
      <CategoryPageContent
        id={resolvedParams.id}
        categoryName={categoryName}
        initialProducts={products}
        initialTotal={total}
        totalPages={totalPages}
        currentPage={currentPage}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}
