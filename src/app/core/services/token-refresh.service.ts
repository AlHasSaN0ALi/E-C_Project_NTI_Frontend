import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, tap, filter, takeUntil } from 'rxjs/operators';
import { TokenService } from './token.service';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { EnvironmentService } from './environment.service';

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    user: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TokenRefreshService implements OnDestroy {
  private refreshInProgress = false;
  private refreshSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new BehaviorSubject<void>(void 0);
  private refreshTimer?: Subscription;
  private readonly REFRESH_BUFFER_TIME = 5 * 60 * 1000; // 5 minutes before expiration

  constructor(
    private tokenService: TokenService,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private environmentService: EnvironmentService
  ) {
    this.initializeTokenRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopRefreshTimer();
  }

  /**
   * Initialize automatic token refresh
   */
  private initializeTokenRefresh(): void {
    // Check if user is authenticated and start refresh timer
    if (this.tokenService.isAuthenticated()) {
      this.startRefreshTimer();
    }

    // Listen for token changes to restart timer
    this.tokenService.getToken$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(token => {
        if (token) {
          this.startRefreshTimer();
        } else {
          this.stopRefreshTimer();
        }
      });
  }

  /**
   * Start the refresh timer
   */
  private startRefreshTimer(): void {
    this.stopRefreshTimer();

    const token = this.tokenService.getToken();
    if (!token) return;

    const expirationTime = this.tokenService.getTokenExpiration(token);
    if (!expirationTime) return;

    const now = new Date();
    const timeUntilRefresh = expirationTime.getTime() - now.getTime() - this.REFRESH_BUFFER_TIME;

    if (timeUntilRefresh > 0) {
      this.refreshTimer = timer(timeUntilRefresh)
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.refreshToken())
        )
        .subscribe({
          next: () => {
            // Token refreshed successfully, restart timer
            this.startRefreshTimer();
          },
          error: (error) => {
            console.error('Token refresh failed:', error);
            this.handleRefreshFailure();
          }
        });
    } else {
      // Token is already expired or expiring soon, refresh immediately
      this.refreshToken().subscribe({
        next: () => this.startRefreshTimer(),
        error: () => this.handleRefreshFailure()
      });
    }
  }

  /**
   * Stop the refresh timer
   */
  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
      this.refreshTimer = undefined;
    }
  }

  /**
   * Refresh the access token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    if (this.refreshInProgress) {
      // If refresh is already in progress, wait for it to complete
      return this.refreshSubject.pipe(
        filter(completed => completed),
        switchMap(() => throwError(() => new Error('Refresh already in progress')))
      );
    }

    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshInProgress = true;
    this.refreshSubject.next(false);

    return this.apiService.post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
      .pipe(
        tap(response => {
          if (response.success) {
            // Update tokens in TokenService
            this.tokenService.setTokens({
              token: response.data.token,
              refreshToken: response.data.refreshToken || refreshToken,
              expiresAt: this.getTokenExpiration(response.data.token),
              user: response.data.user
            });

            // Update AuthService - tokens are already updated via TokenService
            // The AuthService will automatically pick up the changes from TokenService

            this.refreshInProgress = false;
            this.refreshSubject.next(true);

            if (!this.environmentService.isProduction()) {
              console.log('Token refreshed successfully');
            }
          } else {
            throw new Error('Token refresh failed');
          }
        }),
        catchError(error => {
          this.refreshInProgress = false;
          this.refreshSubject.next(false);
          this.handleRefreshFailure();
          return throwError(() => error);
        })
      );
  }

  /**
   * Handle refresh failure
   */
  private handleRefreshFailure(): void {
    this.stopRefreshTimer();
    this.tokenService.clearTokens();
    
    // Show notification to user
    this.notificationService.warning(
      'Your session has expired. Please log in again.',
      'Session Expired'
    );
  }

  /**
   * Get token expiration time from JWT
   */
  private getTokenExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      return Date.now() + (60 * 60 * 1000); // Default to 1 hour
    }
  }

  /**
   * Manually trigger token refresh
   */
  forceRefresh(): Observable<RefreshTokenResponse> {
    return this.refreshToken();
  }

  /**
   * Check if refresh is in progress
   */
  isRefreshInProgress(): boolean {
    return this.refreshInProgress;
  }

  /**
   * Get refresh status as observable
   */
  getRefreshStatus$(): Observable<boolean> {
    return this.refreshSubject.asObservable();
  }

  /**
   * Get time until next refresh (in milliseconds)
   */
  getTimeUntilNextRefresh(): number {
    const token = this.tokenService.getToken();
    if (!token) return 0;

    const expirationTime = this.tokenService.getTokenExpiration(token);
    if (!expirationTime) return 0;

    const now = new Date();
    return Math.max(0, expirationTime.getTime() - now.getTime() - this.REFRESH_BUFFER_TIME);
  }
}
