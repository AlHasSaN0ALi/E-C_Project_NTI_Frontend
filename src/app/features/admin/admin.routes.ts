import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./components/product-management/product-management.component').then(m => m.ProductManagementComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./components/category-management/category-management.component').then(m => m.CategoryManagementComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/order-management/order-management.component').then(m => m.OrderManagementComponent)
  },
  {
    path: 'reviews',
    loadComponent: () => import('./components/review-management/review-management.component').then(m => m.ReviewManagementComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./components/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./components/menu-management/menu-management.component').then(m => m.MenuManagementComponent)
  }
];