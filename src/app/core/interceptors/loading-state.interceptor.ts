import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { LoadingStateService, LoadingType } from '../services/loading-state.service';

export const LoadingStateInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const loadingStateService = inject(LoadingStateService);
  
  // Generate unique request ID
  const requestId = loadingService.generateRequestId(`http_${req.method.toLowerCase()}`);
  
  // Determine loading type based on request
  const loadingType = determineLoadingType(req);
  const loadingMessage = generateLoadingMessage(req);
  
  // Start loading states
  loadingService.showForRequest(requestId);
  loadingStateService.startLoading(requestId, loadingType, loadingMessage, 30000); // 30 second timeout

  return next(req).pipe(
    finalize(() => {
      // Stop loading states
      loadingService.hideForRequest(requestId);
      loadingStateService.stopLoading(requestId);
    })
  );
};

/**
 * Determine loading type based on request characteristics
 */
function determineLoadingType(req: HttpRequest<any>): LoadingType {
  const url = req.url.toLowerCase();
  const method = req.method.toLowerCase();
  
  // Authentication requests
  if (url.includes('/auth/')) {
    return LoadingType.FORM;
  }
  
  // File uploads
  if (req.body instanceof FormData) {
    return LoadingType.UPLOAD;
  }
  
  // Search requests
  if (url.includes('/search') || url.includes('q=')) {
    return LoadingType.SEARCH;
  }
  
  // Navigation/route changes
  if (url.includes('/navigation') || url.includes('/route')) {
    return LoadingType.NAVIGATION;
  }
  
  // Admin operations
  if (url.includes('/admin/')) {
    return LoadingType.COMPONENT;
  }
  
  // User profile operations
  if (url.includes('/user/') || url.includes('/profile')) {
    return LoadingType.FORM;
  }
  
  // Cart operations
  if (url.includes('/cart/')) {
    return LoadingType.BUTTON;
  }
  
  // Order operations
  if (url.includes('/orders/')) {
    return LoadingType.FORM;
  }
  
  // Product operations
  if (url.includes('/product/')) {
    if (method === 'get') {
      return LoadingType.COMPONENT;
    } else {
      return LoadingType.FORM;
    }
  }
  
  // Default based on method
  switch (method) {
    case 'get':
      return LoadingType.COMPONENT;
    case 'post':
    case 'put':
    case 'patch':
    case 'delete':
      return LoadingType.FORM;
    default:
      return LoadingType.COMPONENT;
  }
}

/**
 * Generate appropriate loading message based on request
 */
function generateLoadingMessage(req: HttpRequest<any>): string {
  const url = req.url.toLowerCase();
  const method = req.method.toLowerCase();
  
  // Authentication messages
  if (url.includes('/auth/login')) {
    return 'Signing you in...';
  }
  if (url.includes('/auth/register')) {
    return 'Creating your account...';
  }
  if (url.includes('/auth/logout')) {
    return 'Signing you out...';
  }
  
  // File upload messages
  if (req.body instanceof FormData) {
    return 'Uploading file...';
  }
  
  // Search messages
  if (url.includes('/search')) {
    return 'Searching...';
  }
  
  // Cart messages
  if (url.includes('/cart/add')) {
    return 'Adding to cart...';
  }
  if (url.includes('/cart/update')) {
    return 'Updating cart...';
  }
  if (url.includes('/cart/remove')) {
    return 'Removing from cart...';
  }
  
  // Order messages
  if (url.includes('/orders/create')) {
    return 'Creating order...';
  }
  if (url.includes('/orders/')) {
    return 'Processing order...';
  }
  
  // Product messages
  if (url.includes('/product/')) {
    if (method === 'get') {
      return 'Loading product...';
    } else {
      return 'Saving product...';
    }
  }
  
  // User profile messages
  if (url.includes('/user/') || url.includes('/profile')) {
    return 'Updating profile...';
  }
  
  // Admin messages
  if (url.includes('/admin/')) {
    return 'Processing admin request...';
  }
  
  // Default messages based on method
  switch (method) {
    case 'get':
      return 'Loading...';
    case 'post':
      return 'Creating...';
    case 'put':
    case 'patch':
      return 'Updating...';
    case 'delete':
      return 'Deleting...';
    default:
      return 'Processing...';
  }
}
