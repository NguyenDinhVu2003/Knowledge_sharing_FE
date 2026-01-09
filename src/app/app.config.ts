import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

/**
 * Initialize authentication state before app starts
 * This ensures the user is loaded from storage before any route guards are checked
 */
export function initializeAuth(authService: AuthService) {
  return () => {
    // Force initialization of AuthService to load user from storage
    console.log('[APP_INITIALIZER] Initializing auth state');
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    console.log('[APP_INITIALIZER] Token:', token ? 'exists' : 'none');
    console.log('[APP_INITIALIZER] User:', user ? 'exists' : 'none');
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
