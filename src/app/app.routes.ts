import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
    canActivate: [authGuard]
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.module').then(m => m.DocumentsModule),
    canActivate: [authGuard]
  },
  {
    path: 'my-documents',
    loadComponent: () => import('./features/documents/document-list/document-list.component').then(m => m.DocumentListComponent),
    canActivate: [authGuard],
    data: { myDocuments: true },
    title: 'My Documents'
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule),
    canActivate: [authGuard]
  },
  {
    path: 'favorites',
    loadChildren: () => import('./features/favorites/favorites.module').then(m => m.FavoritesModule),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [authGuard]
  },
  {
    path: 'test-shared',
    loadComponent: () => import('./shared/shared-test/shared-test.component').then(m => m.SharedTestComponent),
    title: 'Shared Components Test'
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];
