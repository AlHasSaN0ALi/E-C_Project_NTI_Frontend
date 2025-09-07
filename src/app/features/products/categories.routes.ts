import { Routes } from '@angular/router';

export const categoriesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/category-list/category-list.component').then(m => m.CategoryListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/category-details/category-details.component').then(m => m.CategoryDetailsComponent)
  }
];
