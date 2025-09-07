import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // First check if we have a valid token
    const token = this.tokenService.getToken();
    
    if (!token || this.tokenService.isTokenExpired(token)) {
      // No token or expired token - redirect to login
      this.redirectToLogin(state.url);
      return false;
    }

    // Check if we have user data in memory
    const currentUser = this.authService.currentUser;
    
    if (currentUser) {
      // User is authenticated - check admin role
      return this.checkAdminRole(currentUser, state.url);
    }

    // Token exists but no user data - try to get profile from backend
    return this.authService.getProfile().pipe(
      take(1),
      map(user => {
        // Profile loaded successfully - check admin role
        return this.checkAdminRole(user, state.url);
      }),
      catchError(error => {
        // Profile loading failed - token might be invalid
        console.warn('AdminGuard: Failed to load user profile:', error);
        this.tokenService.clearTokens();
        this.redirectToLogin(state.url);
        return of(false);
      })
    );
  }

  private checkAdminRole(user: any, returnUrl: string): boolean {
    if (user && user.role === 'admin') {
      return true;
    } else if (user) {
      // User is authenticated but not admin
      this.notificationService.error('Access denied. Admin privileges required.');
      this.router.navigate(['/unauthorized']);
      return false;
    } else {
      // User is not authenticated
      this.redirectToLogin(returnUrl);
      return false;
    }
  }

  private redirectToLogin(returnUrl: string): void {
    this.notificationService.warning('Please log in to access this page.');
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl } 
    });
  }
}
