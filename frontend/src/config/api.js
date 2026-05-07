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

  // Normalize backslashes to forward slashes
  const normalizedUrl = url.replace(/\\/g, '/');

  // 1. Handle relative URLs (e.g., /uploads/...)
  if (normalizedUrl.startsWith('/uploads') || normalizedUrl.startsWith('uploads')) {
    const path = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
    return `${API_BASE_URL}${path}`;
  }

  // 2. Handle legacy hardcoded localhost URLs
  if (normalizedUrl.includes('localhost:5000/uploads')) {
    const pathOnly = normalizedUrl.substring(normalizedUrl.indexOf('/uploads'));
    return `${API_BASE_URL}${pathOnly}`;
  }

  // 3. Return as is
  return normalizedUrl;
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

