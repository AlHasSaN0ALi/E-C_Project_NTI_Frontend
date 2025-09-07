import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <!-- Store Name - Laptop Shop -->
      <div class="brand-section">
        <span class="store-name" routerLink="/home">Laptop Shop</span>
      </div>

       <!-- Category Dropdown -->
       <div class="category-section">
         <mat-form-field appearance="outline" class="category-field">
           <mat-label>Categories</mat-label>
           <mat-select [(value)]="selectedCategory" (selectionChange)="onCategoryChange($event.value)">
             <mat-option value="all">All Categories</mat-option>
             <mat-option value="laptops">Laptops</mat-option>
             <mat-option value="gaming">Gaming</mat-option>
             <mat-option value="business">Business</mat-option>
             <mat-option value="content-creation">Content Creation</mat-option>
           </mat-select>
         </mat-form-field>
       </div>

       <!-- Search Bar -->
       <div class="search-section">
         <mat-form-field appearance="outline" class="search-field">
           <mat-label>Search products & brands</mat-label>
           <input matInput [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Search products & brands">
           <button matSuffix mat-icon-button (click)="onSearch()">
             <mat-icon>search</mat-icon>
           </button>
         </mat-form-field>
       </div>

      <!-- Spacer -->
      <span class="spacer"></span>

      <!-- User Actions -->
      <div class="user-actions">
         <!-- User Profile Icon -->
         <button mat-icon-button [matMenuTriggerFor]="userMenu" *ngIf="isAuthenticated" class="profile-button">
           <mat-icon>person</mat-icon>
         </button>


         <!-- Cart with Badge -->
         <button mat-icon-button routerLink="/cart" [matBadge]="cartItemCount" matBadgeColor="accent" class="cart-button">
           <mat-icon>shopping_cart</mat-icon>
         </button>

        <!-- Login/Logout Button -->
        <button mat-raised-button color="accent" routerLink="/auth/login" *ngIf="!isAuthenticated" class="login-button">
          Login
        </button>
        <button mat-button (click)="logout()" *ngIf="isAuthenticated" class="logout-button">
          Logout
        </button>
      </div>

      <!-- Hamburger Menu Button -->
      <button mat-icon-button (click)="toggleMobileMenu()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>
    </mat-toolbar>

     <!-- Mobile Navigation Menu -->
     <div class="mobile-menu-overlay" *ngIf="showMobileMenu" (click)="closeMobileMenu()"></div>
     <div class="mobile-menu" *ngIf="showMobileMenu">
       <div class="mobile-menu-header">
         <span class="mobile-menu-title">Menu</span>
         <button mat-icon-button (click)="closeMobileMenu()" class="close-button">
           <mat-icon>close</mat-icon>
         </button>
       </div>
       
       <div class="mobile-menu-content">
         <a 
           *ngFor="let menuItem of mobileMenuItems" 
           class="mobile-menu-item" 
           [routerLink]="menuItem.route" 
           (click)="closeMobileMenu()"
         >
           <mat-icon>{{ menuItem.icon }}</mat-icon>
           <span>{{ menuItem.title }}</span>
         </a>
       </div>
     </div>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      <div class="user-menu-header">
        <div class="user-info">
          <p class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
          <p class="user-email">{{ currentUser?.email }}</p>
        </div>
      </div>
      <mat-divider></mat-divider>
       <button mat-menu-item routerLink="/profile">
         <mat-icon>person</mat-icon>
         Profile
       </button>
       <button mat-menu-item routerLink="/orders">
         <mat-icon>receipt</mat-icon>
         Orders
       </button>
       <button mat-menu-item routerLink="/admin" *ngIf="isAdmin">
         <mat-icon>admin_panel_settings</mat-icon>
         Admin Panel
       </button>
       <mat-divider></mat-divider>
       <button mat-menu-item (click)="logout()">
         <mat-icon>exit_to_app</mat-icon>
         Logout
       </button>
    </mat-menu>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedCategory: string = 'all';
  isMobile: boolean = false;
  showMobileMenu: boolean = false;
  cartItemCount: number = 0;
  mobileMenuItems: MenuItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private menuService: MenuService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.subscribeToCartUpdates();
    this.loadMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get currentUser(): User | null {
    return this.authService.currentUser;
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.showMobileMenu = false;
    }
  }

  private subscribeToCartUpdates(): void {
    this.cartService.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe((items: any[]) => {
        this.cartItemCount = items.reduce((total: number, item: any) => total + item.quantity, 0);
      });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', this.searchQuery);
    }
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    // TODO: Implement category filtering functionality
    console.log('Category changed to:', category);
  }

  private loadMenuItems(): void {
    this.menuService.getMenuItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe(menuItems => {
        this.mobileMenuItems = menuItems.filter(item => item.isVisible && item.isActive);
      });
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.notificationService.success('Logged out successfully!');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        // Even if logout fails, user is logged out locally
        console.warn('Logout error:', error);
        this.notificationService.info('Logged out successfully!');
        this.router.navigate(['/home']);
      }
    });
  }
}