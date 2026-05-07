// Centralized API Base URL for easy deployment to Render/Vercel
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// API Endpoints for easy reference
export const API_ENDPOINTS = {
  PRODUCTS: `${API_BASE_URL}/api/products`,
  AUTH: `${API_BASE_URL}/api/auth`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  PAYMENT: `${API_BASE_URL}/api/payment`,
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  ADDRESSES: `${API_BASE_URL}/api/addresses`,
  SELLER: `${API_BASE_URL}/api/seller`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  UPLOADS: `${API_BASE_URL}/uploads`, // For images
};

// Helper to resolve image URLs correctly
export const resolveImageUrl = (url) => {
  if (!url) return '/images/placeholder.png';

  // 1. Handle relative URLs (e.g., /uploads/... or uploads/...)
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_BASE_URL}/${url}`;
  }

  // 2. Handle legacy hardcoded localhost URLs from old DB entries
  if (url.includes('localhost:5000/uploads')) {
    const pathOnly = url.substring(url.indexOf('/uploads'));
    return `${API_BASE_URL}${pathOnly}`;
  }

  // 3. Return as is (already absolute or external)
  return url;
};

// Helper for authenticated requests
export const getAuthHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };

  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
