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
