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
export class GuestGuard implements CanActivate {
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
      // No token or expired token - allow access to guest routes
      return true;
    }

    // Check if we have user data in memory
    const currentUser = this.authService.currentUser;
    
    if (currentUser) {
      // User is already authenticated - redirect to home
      this.redirectToHome();
      return false;
    }

    // Token exists but no user data - try to get profile from backend
    return this.authService.getProfile().pipe(
      take(1),
      map(user => {
        // Profile loaded successfully - user is authenticated
        this.redirectToHome();
        return false;
      }),
      catchError(error => {
        // Profile loading failed - token might be invalid, allow access
        console.warn('GuestGuard: Failed to load user profile:', error);
        this.tokenService.clearTokens();
        return of(true);
      })
    );
  }

  private redirectToHome(): void {
    this.notificationService.info('You are already logged in.');
    this.router.navigate(['/home']);
  }
}
