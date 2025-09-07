import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';

export interface TokenInfo {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<any | null>(null);

  constructor(private environmentService: EnvironmentService) {
    this.loadTokensFromStorage();
  }

  /**
   * Get the current access token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  /**
   * Get the current user
   */
  getCurrentUser(): any | null {
    return this.userSubject.value;
  }

  /**
   * Get token as observable
   */
  getToken$(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Get user as observable
   */
  getCurrentUser$(): Observable<any | null> {
    return this.userSubject.asObservable();
  }

  /**
   * Set tokens and user information
   */
  setTokens(tokenInfo: TokenInfo): void {
    const jwtConfig = this.environmentService.getJwtConfig();
    
    // Store tokens in localStorage
    localStorage.setItem(jwtConfig.tokenKey, tokenInfo.token);
    localStorage.setItem(jwtConfig.refreshTokenKey, tokenInfo.refreshToken);
    localStorage.setItem(jwtConfig.expirationKey, tokenInfo.expiresAt.toString());
    
    // Store user info
    localStorage.setItem('user_info', JSON.stringify(tokenInfo.user));
    
    // Update subjects
    this.tokenSubject.next(tokenInfo.token);
    this.refreshTokenSubject.next(tokenInfo.refreshToken);
    this.userSubject.next(tokenInfo.user);
  }

  /**
   * Clear all tokens and user information
   */
  clearTokens(): void {
    const jwtConfig = this.environmentService.getJwtConfig();
    
    // Remove from localStorage
    localStorage.removeItem(jwtConfig.tokenKey);
    localStorage.removeItem(jwtConfig.refreshTokenKey);
    localStorage.removeItem(jwtConfig.expirationKey);
    localStorage.removeItem('user_info');
    
    // Update subjects
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.userSubject.next(null);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  isTokenExpiringSoon(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60; // 5 minutes in seconds
      return payload.exp < (currentTime + fiveMinutes);
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token?: string): Date | null {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiration(token?: string): number {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) {
      return 0;
    }

    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokensFromStorage(): void {
    const jwtConfig = this.environmentService.getJwtConfig();
    
    const token = localStorage.getItem(jwtConfig.tokenKey);
    const refreshToken = localStorage.getItem(jwtConfig.refreshTokenKey);
    const userInfo = localStorage.getItem('user_info');
    
    if (token && !this.isTokenExpired(token)) {
      this.tokenSubject.next(token);
      this.refreshTokenSubject.next(refreshToken);
      
      if (userInfo) {
        try {
          this.userSubject.next(JSON.parse(userInfo));
        } catch (error) {
          console.error('Error parsing user info from localStorage:', error);
        }
      }
    } else {
      // Token is expired or doesn't exist, clear everything
      this.clearTokens();
    }
  }

  /**
   * Update user information
   */
  updateUserInfo(user: any): void {
    localStorage.setItem('user_info', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /**
   * Get token payload (decoded)
   */
  getTokenPayload(token?: string): any | null {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) {
      return null;
    }

    try {
      return JSON.parse(atob(tokenToCheck.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
}
