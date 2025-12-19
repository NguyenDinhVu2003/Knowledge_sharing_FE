import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = environment.apiUrl;
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize user state from storage on service creation
    this.currentUserSubject.next(this.getUserFromStorage());
  }

  /**
   * Authenticates user with username and password
   * @param username - User's username
   * @param password - User's password
   * @returns Observable with login response containing token and user data
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { username, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap(response => {
        // Validate token exists
        if (!response.token) {
          throw new Error('No token received from server');
        }
        
        // Store token
        this.setToken(response.token);
        
        // Extract user info from response (backend returns user data at root level)
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role
        };
        
        // Store user info
        this.setUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the current user
   * Clears token and user info, then redirects to login
   */
  logout(): Observable<void> {
    const token = this.getToken();
    
    // If no token, just clear local data
    if (!token) {
      this.clearAuthData();
      this.router.navigate(['/auth/login']);
      return of(void 0);
    }

    // Call backend logout endpoint
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        // Clear local data even if backend call fails
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
        return of(void 0);
      })
    );
  }

  /**
   * Registers a new user
   * @param username - Desired username
   * @param email - User's email address
   * @param password - Desired password
   * @returns Observable with registration response containing token and user data
   */
  register(username: string, email: string, password: string): Observable<LoginResponse> {
    const registerRequest = { username, email, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, registerRequest).pipe(
      tap(response => {
        // Store token
        this.setToken(response.token);
        
        // Extract user info from response
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          role: response.role
        };
        
        // Store user info after successful registration
        this.setUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets current user information from backend
   * @returns Observable with current user data
   */
  getCurrentUserFromAPI(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        // Update local user data
        this.setUser(user);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Get current user error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if user is authenticated
   * @returns true if token exists and is valid, false otherwise
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    const isExpired = this.isTokenExpired(token);
    
    if (isExpired) {
      // Token is expired, clear auth data
      this.clearAuthData();
      return false;
    }
    
    // Token is valid
    return true;
  }

  /**
   * Retrieves stored JWT token
   * @returns JWT token string or null if not found
   */
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retrieves current user information
   * @returns User object or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Gets user data as observable for reactive components
   * @returns Observable of User or null
   */
  getCurrentUser$(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Checks if user has a specific role
   * @param role - Role to check
   * @returns true if user has the role, false otherwise
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Private helper methods

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setUser(user: User | null): void {
    if (this.isBrowser && user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson && userJson !== 'undefined' && userJson !== 'null') {
      try {
        const parsed = JSON.parse(userJson);
        // Validate that parsed object has required properties
        if (parsed && typeof parsed === 'object' && parsed.id !== undefined) {
          return parsed as User;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem(this.USER_KEY);
      }
    }
    return null;
  }

  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      // Validate token format
      if (!token || token.split('.').length !== 3) {
        return true;
      }
      
      // Decode JWT token (payload is the second part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token has expiration time
      if (!payload.exp) {
        // Token has no expiration, treat as valid
        return false;
      }
      
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expirationDate <= now;
      
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider invalid tokens as expired
    }
  }
}
