import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from '../services/environment.service';

export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
  const environmentService = inject(EnvironmentService);
  
  // Add common headers
  req = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Add cache control for GET requests (except for dynamic content)
  if (req.method === 'GET' && shouldCache(req.url)) {
    req = req.clone({
      setHeaders: {
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        // Log successful API calls in development
        if (!environmentService.isProduction()) {
          console.log(`API Success: ${req.method} ${req.url}`, {
            status: event.status,
            data: event.body
          });
        }
        
        // Handle specific response formatting if needed
        if (event.body && typeof event.body === 'object') {
          // Ensure consistent response structure
          const response = event.body as any;
          
          // If the backend returns data directly, wrap it in a consistent structure
          if (response.data !== undefined && !response.success && !response.message) {
            // This might be a direct data response, which is fine
            return;
          }
        }
      }
    })
  );
};

/**
 * Determine if a request should be cached
 */
function shouldCache(url: string): boolean {
  // Don't cache auth-related requests
  if (url.includes('/auth/')) {
    return false;
  }
  
  // Don't cache user-specific requests
  if (url.includes('/user/') || url.includes('/cart/') || url.includes('/orders/')) {
    return false;
  }
  
  // Don't cache admin requests
  if (url.includes('/admin/')) {
    return false;
  }
  
  // Cache static content like categories, about-us, etc.
  const cacheableEndpoints = [
    '/category',
    '/about-us',
    '/contact-us',
    '/faq'
  ];
  
  return cacheableEndpoints.some(endpoint => url.includes(endpoint));
}
