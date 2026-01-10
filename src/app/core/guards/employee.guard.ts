import { inject } from '@angular/core';
import { CanMatchFn, Router, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Employee Guard - Protect employee routes
 * Only users with EMPLOYEE role can access
 * ADMIN users will be redirected to admin dashboard
 */
export const employeeGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const currentUser = authService.getCurrentUser();

  // Only allow EMPLOYEE role (not ADMIN)
  return currentUser !== null && currentUser.role !== 'ADMIN';
};
