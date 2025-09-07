import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  constructor() { }

  /**
   * Get the full API URL for a specific endpoint
   */
  getApiUrl(endpoint: string = ''): string {
    return `${environment.apiUrl}${endpoint}`;
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return environment.baseUrl;
  }

  /**
   * Get the image URL for uploaded files
   */
  getImageUrl(imagePath: string = ''): string {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /uploads, use the full image URL
    if (imagePath.startsWith('/uploads')) {
      return `${environment.imageUrl}${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the image URL
    return `${environment.imageUrl}/${imagePath}`;
  }

  /**
   * Get specific endpoint URL
   */
  getEndpointUrl(endpoint: keyof typeof environment.endpoints): string {
    return environment.endpoints[endpoint];
  }

  /**
   * Get JWT configuration
   */
  getJwtConfig() {
    return environment.jwt;
  }

  /**
   * Get upload configuration
   */
  getUploadConfig() {
    return environment.upload;
  }

  /**
   * Get pagination configuration
   */
  getPaginationConfig() {
    return environment.pagination;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof typeof environment.features): boolean {
    return environment.features[feature];
  }

  /**
   * Get app information
   */
  getAppInfo() {
    return {
      name: environment.appName,
      version: environment.version,
      production: environment.production
    };
  }

  /**
   * Get performance configuration
   */
  getPerformanceConfig() {
    return environment.performance;
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return environment.security;
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig() {
    return environment.monitoring;
  }

  /**
   * Check if we're in production mode
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig() {
    return {
      production: environment.production,
      apiUrl: environment.apiUrl,
      baseUrl: environment.baseUrl,
      imageUrl: environment.imageUrl
    };
  }
}
