import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, throwError, from, Subject, of } from 'rxjs';
import { map, catchError, tap, switchMap, takeUntil } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { TokenRefreshService } from './token-refresh.service';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private apiService: ApiService,
    private tokenService: TokenService,
    private tokenRefreshService: TokenRefreshService
  ) {
    this.loadUserFromStorage();
    
    // Subscribe to token service changes to keep AuthService in sync
    this.tokenService.getCurrentUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUserSubject.next(user);
      });
  }

  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Get current user
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get auth token
  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get token method for interceptor
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  get isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated() && !!this.currentUser;
  }

  // Check if user is admin
  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Login user
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data.user, response.data.token);
            if (response.data.refreshToken) {
              localStorage.setItem('refresh_token', response.data.refreshToken);
            }
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  // Register user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setAuthData(response.data.user, response.data.token);
            if (response.data.refreshToken) {
              localStorage.setItem('refresh_token', response.data.refreshToken);
            }
          }
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  // Logout user
  logout(): Observable<any> {
    const refreshToken = this.tokenService.getRefreshToken();
    
    // Call backend logout endpoint if refresh token exists
    if (refreshToken) {
      return this.apiService.post('/auth/logout', { refreshToken })
        .pipe(
          tap(() => {
            // Clear tokens and user data on successful logout
            this.clearUserSession();
          }),
          catchError(error => {
            // Even if backend logout fails, clear local session
            console.warn('Backend logout failed, clearing local session:', error);
            this.clearUserSession();
            return of(null); // Return success to continue with local logout
          })
        );
    } else {
      // No refresh token, just clear local session
      this.clearUserSession();
      return of(null);
    }
  }

  // Clear user session data
  private clearUserSession(): void {
    // Use TokenService for centralized token management
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
  }

  // Get user profile
  getProfile(): Observable<User> {
    return this.apiService.get<User>('/auth/profile')
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
        catchError(error => {
          console.error('Get profile error:', error);
          return throwError(() => error);
        })
      );
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.apiService.put<User>('/auth/profile', userData)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }),
        catchError(error => {
          console.error('Update profile error:', error);
          return throwError(() => error);
        })
      );
  }

  // Change password
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.apiService.put('/auth/change-password', passwordData)
      .pipe(
        catchError(error => {
          console.error('Change password error:', error);
          return throwError(() => error);
        })
      );
  }

  // Refresh token
  refreshToken(): Promise<any> {
    return this.tokenRefreshService.refreshToken().toPromise();
  }

  // Private methods
  private setAuthData(user: User, token: string, refreshToken?: string): void {
    // Use TokenService for centralized token management
    this.tokenService.setTokens({
      token,
      refreshToken: refreshToken || this.tokenService.getRefreshToken() || '',
      expiresAt: this.getTokenExpiration(token),
      user
    });

    // Update local state
    this.currentUserSubject.next(user);
  }

  // Get token expiration time from JWT
  private getTokenExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return Date.now() + (60 * 60 * 1000); // Default to 1 hour
    }
  }

  private loadUserFromStorage(): void {
    // Use TokenService for centralized token management
    const user = this.tokenService.getCurrentUser();
    if (user && this.tokenService.isAuthenticated()) {
      this.currentUserSubject.next(user);
    } else {
      this.logout();
    }
  }
}
