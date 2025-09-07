import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    LoadingComponent
  ],
  template: `
    <mat-sidenav-container class="admin-container">
      <!-- Sidebar -->
      <mat-sidenav #sidenav mode="side" opened class="admin-sidenav">
        <div class="sidenav-header">
          <h2 class="admin-title">
            <mat-icon>admin_panel_settings</mat-icon>
            Admin Panel
          </h2>
        </div>
        
        <mat-nav-list class="admin-nav-list">
          <!-- Dashboard -->
          <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <mat-divider></mat-divider>

          <!-- Product Management -->
          <a mat-list-item routerLink="/admin/products" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Products</span>
          </a>

          <!-- Category Management -->
          <a mat-list-item routerLink="/admin/categories" routerLinkActive="active">
            <mat-icon matListItemIcon>category</mat-icon>
            <span matListItemTitle>Categories</span>
          </a>

          <mat-divider></mat-divider>

          <!-- Order Management -->
          <a mat-list-item routerLink="/admin/orders" routerLinkActive="active">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Orders</span>
          </a>

          <!-- User Management -->
          <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>

          <!-- Review Management -->
          <a mat-list-item routerLink="/admin/reviews" routerLinkActive="active">
            <mat-icon matListItemIcon>rate_review</mat-icon>
            <span matListItemTitle>Reviews</span>
          </a>

          <mat-divider></mat-divider>

          <!-- Analytics -->
          <a mat-list-item routerLink="/admin/analytics" routerLinkActive="active">
            <mat-icon matListItemIcon>analytics</mat-icon>
            <span matListItemTitle>Analytics</span>
          </a>

          <!-- Settings -->
          <a mat-list-item routerLink="/admin/settings" routerLinkActive="active">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <div class="user-details">
              <p class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
              <p class="user-role">Administrator</p>
            </div>
          </div>
          <button mat-button (click)="logout()" class="logout-button">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content class="admin-content">
        <mat-toolbar class="admin-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">{{ pageTitle }}</span>
          <span class="spacer"></span>
          <button mat-icon-button routerLink="/home" matTooltip="Back to Store">
            <mat-icon>store</mat-icon>
          </button>
        </mat-toolbar>

        <div class="admin-main-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <app-loading></app-loading>
  `,
  styles: [`
    .admin-container {
      height: 100vh;
    }

    .admin-sidenav {
      width: 280px;
      background: #2c3e50;
      color: white;
    }

    .sidenav-header {
      padding: 1.5rem 1rem;
      background: #34495e;
      border-bottom: 1px solid #4a5f7a;
    }

    .admin-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
    }

    .admin-nav-list {
      padding: 0;
    }

    .admin-nav-list a {
      color: #bdc3c7;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .admin-nav-list a:hover {
      background-color: #34495e;
      color: white;
    }

    .admin-nav-list a.active {
      background-color: #3498db;
      color: white;
    }

    .admin-nav-list mat-icon {
      color: inherit;
    }

    .sidenav-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: #34495e;
      border-top: 1px solid #4a5f7a;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-info mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #3498db;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      margin: 0;
      font-weight: 600;
      color: white;
      font-size: 0.9rem;
    }

    .user-role {
      margin: 0;
      color: #bdc3c7;
      font-size: 0.8rem;
    }

    .logout-button {
      width: 100%;
      color: #e74c3c;
      border: 1px solid #e74c3c;
    }

    .logout-button:hover {
      background-color: #e74c3c;
      color: white;
    }

    .admin-content {
      background: #f8f9fa;
    }

    .admin-toolbar {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .menu-button {
      margin-right: 1rem;
    }

    .toolbar-title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .admin-main-content {
      padding: 2rem;
      min-height: calc(100vh - 64px);
    }

    @media (max-width: 768px) {
      .admin-sidenav {
        width: 100%;
        max-width: 280px;
      }

      .admin-main-content {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .admin-main-content {
        padding: 0.5rem;
      }

      .toolbar-title {
        font-size: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  pageTitle: string = 'Admin Dashboard';

  constructor(public authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  logout(): void {
    this.authService.logout();
  }
}
