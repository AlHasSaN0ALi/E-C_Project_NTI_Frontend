import { Routes } from '@angular/router';

export const reviewsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    loadComponent: () => import('./components/review-list/review-list.component').then(m => m.ReviewListComponent)
  },
  {
    path: 'stats/:productId',
    loadComponent: () => import('./components/review-stats/review-stats.component').then(m => m.ReviewStatsComponent)
  }
];
