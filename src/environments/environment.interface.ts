export interface Environment {
  production: boolean;
  apiUrl: string;
  baseUrl: string;
  imageUrl: string;
  appName: string;
  version: string;
  
  endpoints: {
    auth: string;
    user: string;
    product: string;
    category: string;
    cart: string;
    orders: string;
    review: string;
    dashboard: string;
    aboutUs: string;
    contactUs: string;
    faq: string;
  };
  
  jwt: {
    tokenKey: string;
    refreshTokenKey: string;
    expirationKey: string;
  };
  
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };
  
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  
  features: {
    enableReviews: boolean;
    enableWishlist: boolean;
    enableNotifications: boolean;
    enableDarkMode: boolean;
    enableOfflineMode: boolean;
  };
  
  performance?: {
    enableLazyLoading: boolean;
    enablePreloading: boolean;
    enableServiceWorker: boolean;
    enableCaching: boolean;
    cacheTimeout: number;
    maxCacheSize: number;
  };
  
  security?: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableXSSProtection: boolean;
    enableCSRFProtection: boolean;
  };
  
  monitoring?: {
    sentry: {
      dsn: string;
      environment: string;
    };
    analytics: {
      googleAnalytics: string;
      hotjar: string;
    };
  };
}
