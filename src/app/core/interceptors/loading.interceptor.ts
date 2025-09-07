import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Show loading for non-GET requests or specific endpoints
  if (shouldShowLoading(req)) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};

function shouldShowLoading(req: any): boolean {
  const url = req.url;
  const method = req.method;
  
  // Always show loading for non-GET requests
  if (method !== 'GET') {
    return true;
  }
  
  // Show loading for specific endpoints that might take longer
  const loadingEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/orders',
    '/checkout',
    '/cart/add',
    '/cart/update',
    '/cart/remove',
    '/product/create',
    '/product/update',
    '/product/delete',
    '/user/profile',
    '/user/change-password',
    '/admin/dashboard',
    '/admin/users',
    '/admin/products',
    '/admin/orders',
    '/admin/categories',
    '/admin/reviews'
  ];
  
  // Show loading for file uploads
  if (url.includes('/upload') || url.includes('/images')) {
    return true;
  }
  
  // Show loading for search requests (might take time)
  if (url.includes('/search')) {
    return true;
  }
  
  // Show loading for paginated requests with large page numbers
  if (url.includes('page=') && url.includes('limit=')) {
    const pageMatch = url.match(/page=(\d+)/);
    const limitMatch = url.match(/limit=(\d+)/);
    if (pageMatch && limitMatch) {
      const page = parseInt(pageMatch[1]);
      const limit = parseInt(limitMatch[1]);
      // Show loading for pages beyond 1 or large limits
      return page > 1 || limit > 20;
    }
  }
  
  return loadingEndpoints.some(endpoint => url.includes(endpoint));
}
