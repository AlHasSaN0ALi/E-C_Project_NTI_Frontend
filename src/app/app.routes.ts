import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // Public routes
  { 
    path: 'home', 
    loadComponent: () => import('./features/products/components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'customer-service', 
    loadComponent: () => import('./shared/components/customer-service/customer-service.component').then(m => m.CustomerServiceComponent)
  },
  { 
    path: 'products', 
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes)
  },
  { 
    path: 'categories', 
    loadChildren: () => import('./features/products/categories.routes').then(m => m.categoriesRoutes)
  },
  
  // Authentication routes
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  
  // Public cart route (users can view cart without login)
  { 
    path: 'cart', 
    loadComponent: () => import('./features/cart/components/cart/cart.component').then(m => m.CartComponent)
  },
  
  // Protected user routes
  { 
    path: 'orders', 
    loadChildren: () => import('./features/orders/orders.routes').then(m => m.ordersRoutes),
    canActivate: [AuthGuard]
  },
  { 
    path: 'reviews', 
    loadChildren: () => import('./features/reviews/reviews.routes').then(m => m.reviewsRoutes)
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./features/auth/components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  
  // Admin routes
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [AdminGuard]
  },
  
  // Error routes
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  { 
    path: '**', 
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
