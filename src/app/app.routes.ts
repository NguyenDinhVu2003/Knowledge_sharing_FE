import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Home - Knowledge Sharing Platform'
  },
  {
    path: 'test-shared',
    loadComponent: () => import('./shared/shared-test/shared-test.component').then(m => m.SharedTestComponent),
    title: 'Shared Components Test'
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];
