import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/test-shared',
    pathMatch: 'full'
  },
  {
    path: 'test-shared',
    loadComponent: () => import('./shared/shared-test/shared-test.component').then(m => m.SharedTestComponent),
    title: 'Shared Components Test'
  }
];
