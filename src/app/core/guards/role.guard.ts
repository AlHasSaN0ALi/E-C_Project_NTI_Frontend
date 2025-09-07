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
export class RoleGuard implements CanActivate {
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
    // Get required roles from route data
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.warn('RoleGuard: No roles specified in route data');
      return true;
    }

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
      // User is authenticated - check role
      return this.checkUserRole(currentUser, requiredRoles, state.url);
    }

    // Token exists but no user data - try to get profile from backend
    return this.authService.getProfile().pipe(
      take(1),
      map(user => {
        // Profile loaded successfully - check role
        return this.checkUserRole(user, requiredRoles, state.url);
      }),
      catchError(error => {
        // Profile loading failed - token might be invalid
        console.warn('RoleGuard: Failed to load user profile:', error);
        this.tokenService.clearTokens();
        this.redirectToLogin(state.url);
        return of(false);
      })
    );
  }

  private checkUserRole(user: any, requiredRoles: string[], returnUrl: string): boolean {
    if (!user) {
      this.redirectToLogin(returnUrl);
      return false;
    }

    const userRole = user.role;
    
    if (requiredRoles.includes(userRole)) {
      return true;
    } else {
      // User doesn't have required role
      this.notificationService.error(`Access denied. Required role: ${requiredRoles.join(' or ')}`);
      this.router.navigate(['/unauthorized']);
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
