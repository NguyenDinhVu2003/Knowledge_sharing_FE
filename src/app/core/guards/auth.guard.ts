import { CanMatchFn, CanActivateFn, Router, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if token exists in localStorage
  const token = authService.getToken();
  const isAuth = authService.isAuthenticated();
  
  if (isAuth && token) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = '/' + segments.map(s => s.path).join('/');
  
  // Redirect to login page with return URL
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: returnUrl }
  });
  
  return false;
};

/**
 * Route guard that prevents authenticated users from accessing auth pages
 * Redirects to home page if user is already authenticated
 */
export const noAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect to home page if already authenticated
  router.navigate(['/']);
  return false;
};

/**
 * Route guard that checks if user has required role
 * Usage: Add 'roles' data to route configuration
 * Example: { path: 'admin', canActivate: [roleGuard], data: { roles: ['ADMIN'] } }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authService.getCurrentUser();
  
  if (currentUser && requiredRoles.includes(currentUser.role)) {
    return true;
  }

  // Redirect to unauthorized page or home
  router.navigate(['/unauthorized']);
  return false;
};
