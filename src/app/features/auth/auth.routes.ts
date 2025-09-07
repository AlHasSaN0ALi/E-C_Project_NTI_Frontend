import { Routes } from '@angular/router';
import { GuestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
