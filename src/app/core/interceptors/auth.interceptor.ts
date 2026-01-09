import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor that attaches JWT token to outgoing requests
 * Automatically adds Authorization header with Bearer token for authenticated requests
 * Handles 401 Unauthorized responses by redirecting to login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  console.log('[AuthInterceptor] Request to:', req.url, 'Token:', token ? 'exists' : 'NO TOKEN');

  // Skip interceptor for auth endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[AuthInterceptor] Added Authorization header to request');
  } else {
    console.warn('[AuthInterceptor] No token available to add to request');
  }

  // Handle response and catch 401 errors
  return next(authReq).pipe(
    catchError(error => {
      // If 401 Unauthorized, clear auth data and redirect to login
      // But only if we're not already on an auth page
      if (error.status === 401) {
        console.error('[AuthInterceptor] ❌ Received 401 from:', req.url);
        
        // Don't clear auth or redirect if we're already on an auth page
        if (!router.url.includes('/auth/')) {
          console.log('[AuthInterceptor] Clearing auth data and redirecting to login');
          authService.logout().subscribe();
        }
      }
      return throwError(() => error);
    })
  );
};
