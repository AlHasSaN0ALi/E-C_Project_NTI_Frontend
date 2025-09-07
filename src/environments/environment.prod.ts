import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api',
  baseUrl: 'https://your-production-domain.com',
  imageUrl: 'https://your-production-domain.com/uploads',
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
  },
  
  // Performance
  performance: {
    enableLazyLoading: true,
    enablePreloading: true,
    enableServiceWorker: true,
    enableCaching: true,
    cacheTimeout: 300000, // 5 minutes
    maxCacheSize: 50 // MB
  },
  
  // Security
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableCSRFProtection: true
  },
  
  // Monitoring
  monitoring: {
    sentry: {
      dsn: 'https://your-sentry-dsn@sentry.io/project-id',
      environment: 'production'
    },
    analytics: {
      googleAnalytics: 'GA_MEASUREMENT_ID',
      hotjar: 'HOTJAR_ID'
    }
  }
};