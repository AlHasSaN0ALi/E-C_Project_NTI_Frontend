import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  baseUrl: 'http://localhost:3000',
  imageUrl: 'http://localhost:3000/uploads',
  appName: 'Laptop Shop',
  version: '1.0.0',
  
  // API Endpoints
  endpoints: {
    auth: '/api/auth',
    user: '/api/user',
    product: '/api/product',
    category: '/api/category',
    cart: '/api/cart',
    orders: '/api/orders',
    review: '/api/review',
    dashboard: '/api/dashboard',
    aboutUs: '/api/about-us',
    contactUs: '/api/contact-us',
    faq: '/api/faq'
  },
  
  // JWT Configuration
  jwt: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    expirationKey: 'token_expiration'
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 10
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  
  // Features
  features: {
    enableReviews: true,
    enableWishlist: false,
    enableNotifications: true,
    enableDarkMode: true,
    enableOfflineMode: false
  }
};
