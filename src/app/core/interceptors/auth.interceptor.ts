import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { EnvironmentService } from '../services/environment.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const environmentService = inject(EnvironmentService);
  
  // Skip adding token for auth endpoints and public endpoints
  if (shouldSkipAuth(req, environmentService)) {
    return next(req);
  }

  const token = authService.getToken();
  
  if (token && !isTokenExpired(token)) {
    // Clone the request and add the authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': req.headers.get('Content-Type') || 'application/json'
      }
    });
  } else if (token && isTokenExpired(token)) {
    // Token is expired, try to refresh it
    return from(authService.refreshToken()).pipe(
      switchMap(() => {
        const newToken = authService.getToken();
        if (newToken) {
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
              'Content-Type': req.headers.get('Content-Type') || 'application/json'
            }
          });
        }
        return next(req);
      }),
      catchError(() => {
        // Refresh failed, logout user
        authService.logout();
        return next(req);
      })
    );
  }

  return next(req);
};

/**
 * Check if the request should skip authentication
 */
function shouldSkipAuth(req: HttpRequest<any>, environmentService: EnvironmentService): boolean {
  const url = req.url;
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];
  
  const publicEndpoints = [
    '/product',
    '/category',
    '/about-us',
    '/contact-us',
    '/faq'
  ];

  // Skip auth for auth endpoints
  if (authEndpoints.some(endpoint => url.includes(endpoint))) {
    return true;
  }

  // Skip auth for public GET requests
  if (req.method === 'GET' && publicEndpoints.some(endpoint => url.includes(endpoint))) {
    return true;
  }

  // Skip auth for image requests
  if (url.includes('/uploads/') || url.includes('/images/')) {
    return true;
  }

  return false;
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
}
