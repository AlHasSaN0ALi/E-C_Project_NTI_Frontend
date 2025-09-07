import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, interval, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { TokenService } from '../../../core/services/token.service';
import { TokenRefreshService } from '../../../core/services/token-refresh.service';
import { EnvironmentService } from '../../../core/services/environment.service';

@Component({
  selector: 'app-token-monitor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="token-monitor-card" *ngIf="showMonitor">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>security</mat-icon>
          Token Monitor
        </mat-card-title>
        <mat-card-subtitle>JWT Token Status & Management</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Authentication Status -->
        <div class="status-section">
          <h4>Authentication Status</h4>
          <mat-chip [color]="isAuthenticated ? 'primary' : 'warn'" selected>
            <mat-icon>{{ isAuthenticated ? 'check_circle' : 'error' }}</mat-icon>
            {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
          </mat-chip>
        </div>

        <mat-divider></mat-divider>

        <!-- Token Information -->
        <div class="token-info" *ngIf="isAuthenticated">
          <h4>Token Information</h4>
          
          <!-- Token Expiration -->
          <div class="info-item">
            <label>Expires At:</label>
            <span>{{ tokenExpiration | date:'medium' }}</span>
          </div>

          <!-- Time Until Expiration -->
          <div class="info-item">
            <label>Time Until Expiration:</label>
            <span>{{ timeUntilExpiration | date:'mm:ss':'UTC' }}</span>
          </div>

          <!-- Expiration Progress -->
          <div class="info-item">
            <label>Expiration Progress:</label>
            <mat-progress-bar 
              mode="determinate" 
              [value]="expirationProgress"
              [color]="expirationProgress > 80 ? 'warn' : 'primary'">
            </mat-progress-bar>
            <span class="progress-text">{{ expirationProgress | number:'1.1-1' }}%</span>
          </div>

          <!-- Refresh Status -->
          <div class="info-item">
            <label>Refresh Status:</label>
            <mat-chip [color]="isRefreshInProgress ? 'accent' : 'primary'" selected>
              <mat-icon>{{ isRefreshInProgress ? 'refresh' : 'check' }}</mat-icon>
              {{ isRefreshInProgress ? 'Refreshing...' : 'Ready' }}
            </mat-chip>
          </div>

          <!-- Time Until Next Refresh -->
          <div class="info-item" *ngIf="!isRefreshInProgress">
            <label>Next Refresh In:</label>
            <span>{{ timeUntilNextRefresh | date:'mm:ss':'UTC' }}</span>
          </div>
        </div>

        <!-- User Information -->
        <div class="user-info" *ngIf="currentUser">
          <h4>User Information</h4>
          <div class="info-item">
            <label>Name:</label>
            <span>{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ currentUser.email }}</span>
          </div>
          <div class="info-item">
            <label>Role:</label>
            <mat-chip [color]="currentUser.role === 'admin' ? 'accent' : 'primary'" selected>
              {{ currentUser.role | titlecase }}
            </mat-chip>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <h4>Actions</h4>
          <div class="action-buttons">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="forceRefresh()"
              [disabled]="isRefreshInProgress || !isAuthenticated">
              <mat-icon>refresh</mat-icon>
              Force Refresh
            </button>
            
            <button 
              mat-raised-button 
              color="warn" 
              (click)="clearTokens()"
              [disabled]="!isAuthenticated">
              <mat-icon>logout</mat-icon>
              Clear Tokens
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .token-monitor-card {
      max-width: 600px;
      margin: 20px auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .status-section,
    .token-info,
    .user-info,
    .actions-section {
      margin: 20px 0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 10px 0;
      padding: 8px 0;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
    }

    .info-item span {
      color: #333;
    }

    .progress-text {
      margin-left: 10px;
      font-size: 0.9em;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class TokenMonitorComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  currentUser: any = null;
  tokenExpiration: Date | null = null;
  timeUntilExpiration = 0;
  expirationProgress = 0;
  isRefreshInProgress = false;
  timeUntilNextRefresh = 0;
  showMonitor = false;

  private destroy$ = new Subject<void>();
  private updateInterval$ = interval(1000); // Update every second

  constructor(
    private tokenService: TokenService,
    private tokenRefreshService: TokenRefreshService,
    private environmentService: EnvironmentService
  ) {
    // Only show in development mode
    this.showMonitor = !this.environmentService.isProduction();
  }

  ngOnInit(): void {
    if (!this.showMonitor) return;

    // Subscribe to authentication status
    this.tokenService.getCurrentUser$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.isAuthenticated = this.tokenService.isAuthenticated();
        this.updateTokenInfo();
      });

    // Subscribe to refresh status
    this.tokenRefreshService.getRefreshStatus$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isRefreshInProgress = this.tokenRefreshService.isRefreshInProgress();
      });

    // Update token info every second
    this.updateInterval$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTokenInfo();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTokenInfo(): void {
    if (!this.isAuthenticated) {
      this.tokenExpiration = null;
      this.timeUntilExpiration = 0;
      this.expirationProgress = 0;
      this.timeUntilNextRefresh = 0;
      return;
    }

    const token = this.tokenService.getToken();
    if (token) {
      this.tokenExpiration = this.tokenService.getTokenExpiration(token);
      this.timeUntilExpiration = this.tokenService.getTimeUntilExpiration(token);
      this.timeUntilNextRefresh = this.tokenRefreshService.getTimeUntilNextRefresh();

      // Calculate expiration progress (0-100%)
      const totalLifetime = 60 * 60 * 1000; // Assume 1 hour token lifetime
      const remainingTime = this.timeUntilExpiration * 1000; // Convert to milliseconds
      this.expirationProgress = Math.max(0, Math.min(100, ((totalLifetime - remainingTime) / totalLifetime) * 100));
    }
  }

  forceRefresh(): void {
    this.tokenRefreshService.forceRefresh().subscribe({
      next: () => {
        console.log('Token refreshed successfully');
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
      }
    });
  }

  clearTokens(): void {
    this.tokenService.clearTokens();
    console.log('Tokens cleared');
  }
}
