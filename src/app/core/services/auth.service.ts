import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, of, delay } from 'rxjs';
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
    // MOCK AUTHENTICATION FOR TESTING
    // TODO: Replace with actual backend API call when ready
    
    // Check mock credentials
    if (username === 'admin' && password === 'admin123') {
      // Create mock response
      const mockToken = this.generateMockToken('admin', 'ADMIN');
      const mockUser: User = {
        id: 1,
        username: 'admin',
        email: 'admin@knowledgesharing.com',
        role: 'ADMIN'
      };
      
      const mockResponse: LoginResponse = {
        token: mockToken,
        user: mockUser
      };
      
      // Simulate network delay and return response
      return of(mockResponse).pipe(
        delay(800),
        tap(response => {
          // Store token and user info
          this.setToken(response.token);
          this.setUser(response.user);
          this.currentUserSubject.next(response.user);
        })
      );
    } else {
      // Return error for invalid credentials
      return throwError(() => ({ 
        error: { 
          message: 'Invalid username or password' 
        } 
      })).pipe(
        delay(800)
      ) as Observable<LoginResponse>;
    }
    
    /* ORIGINAL API IMPLEMENTATION - Uncomment when backend is ready
    const loginRequest: LoginRequest = { username, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap(response => {
        // Store token and user info
        this.setToken(response.token);
        this.setUser(response.user);
        this.currentUserSubject.next(response.user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
    */
  }

  /**
   * Logs out the current user
   * Clears token and user info, then redirects to login
   */
  logout(): void {
    // Call backend logout endpoint
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Clear local data even if backend call fails
        this.clearAuthData();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * Checks if user is authenticated
   * @returns true if token exists and is valid, false otherwise
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    return !this.isTokenExpired(token);
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

  private setUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getUserFromStorage(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
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
      // Decode JWT token (payload is the second part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token has expiration time
      if (!payload.exp) {
        return false;
      }
      
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider invalid tokens as expired
    }
  }

  /**
   * Generates a mock JWT token for testing
   * @param username - Username to encode
   * @param role - User role to encode
   * @returns Mock JWT token string
   */
  private generateMockToken(username: string, role: string): string {
    // Create mock JWT header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    // Create mock JWT payload with 24 hour expiration
    const payload = {
      sub: username,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    // Base64 encode header and payload
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    // Mock signature (not cryptographically secure, only for testing)
    const signature = btoa('mock-signature');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
