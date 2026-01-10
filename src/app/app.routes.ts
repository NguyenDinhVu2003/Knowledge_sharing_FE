import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { employeeGuard } from './core/guards/employee.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
    canMatch: [authGuard, employeeGuard]
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.module').then(m => m.DocumentsModule),
    canMatch: [authGuard, employeeGuard]
  },
  {
    path: 'my-documents',
    loadComponent: () => import('./features/documents/document-list/document-list.component').then(m => m.DocumentListComponent),
    canMatch: [authGuard, employeeGuard],
    data: { myDocuments: true },
    title: 'My Documents'
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule),
    canMatch: [authGuard, employeeGuard]
  },
  {
    path: 'favorites',
    loadChildren: () => import('./features/favorites/favorites.module').then(m => m.FavoritesModule),
    canMatch: [authGuard, employeeGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canMatch: [authGuard, employeeGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canMatch: [authGuard, employeeGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canMatch: [authGuard, adminGuard],
    title: 'Admin Panel'
  },
  {
    path: 'test-shared',
    loadComponent: () => import('./shared/shared-test/shared-test.component').then(m => m.SharedTestComponent),
    title: 'Shared Components Test'
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/role-redirect.component').then(m => m.RoleRedirectComponent),
    pathMatch: 'full'
  },
  // Wildcard route - redirect to root for role-based handling
  {
    path: '**',
    loadComponent: () => import('./shared/components/role-redirect.component').then(m => m.RoleRedirectComponent)
  }
];
