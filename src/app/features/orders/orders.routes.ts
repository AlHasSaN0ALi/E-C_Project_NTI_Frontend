import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/order-details/order-details.component').then(m => m.OrderDetailsComponent)
  }
];
