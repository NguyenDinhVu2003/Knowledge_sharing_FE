import { inject } from '@angular/core';
import { CanMatchFn, Router, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin Guard - Protect admin routes
 * Only users with ADMIN role can access
 */
export const adminGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const currentUser = authService.getCurrentUser();

  // Only allow ADMIN role
  return currentUser !== null && currentUser.role === 'ADMIN';
};
