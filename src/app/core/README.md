# Core Module Documentation

## Overview
The Core module contains the essential authentication infrastructure and shared models for the Internal Knowledge Sharing Platform. This module should be imported only once in the application.

## Structure

```
core/
├── models/                 # TypeScript interfaces and types
│   ├── user.model.ts      # User interface and auth-related types
│   ├── document.model.ts  # Document interface and related types
│   ├── notification.model.ts # Notification interface
│   └── index.ts           # Barrel export
├── services/              # Core services
│   ├── auth.service.ts    # Authentication service
│   └── index.ts          # Barrel export
├── interceptors/         # HTTP interceptors
│   ├── auth.interceptor.ts # JWT token interceptor
│   └── index.ts          # Barrel export
├── guards/               # Route guards
│   ├── auth.guard.ts     # Authentication guards
│   └── index.ts         # Barrel export
└── index.ts             # Main barrel export
```

## Models

### User Model
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}
```

### Document Model
```typescript
interface Document {
  id: number;
  title: string;
  summary: string;
  file_path: string;
  file_type: string;
  owner_id: number;
  sharing_level: string;
  created_at: Date;
  updated_at: Date;
  version_number: number;
  is_archived: boolean;
}
```

### Notification Model
```typescript
interface Notification {
  id: number;
  user_id: number;
  document_id: number;
  message: string;
  is_read: boolean;
  created_at: Date;
}
```

## AuthService

### Methods

#### `login(username: string, password: string): Observable<LoginResponse>`
Authenticates user with credentials and stores token and user data.

**Example:**
```typescript
this.authService.login('john.doe', 'password123').subscribe({
  next: (response) => {
    console.log('Login successful', response.user);
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    console.error('Login failed', error);
  }
});
```

#### `logout(): void`
Logs out the current user, clears stored data, and redirects to login page.

**Example:**
```typescript
this.authService.logout();
```

#### `isAuthenticated(): boolean`
Checks if user is authenticated and token is valid.

**Example:**
```typescript
if (this.authService.isAuthenticated()) {
  // User is logged in
}
```

#### `getToken(): string | null`
Retrieves the stored JWT token.

**Example:**
```typescript
const token = this.authService.getToken();
```

#### `getCurrentUser(): User | null`
Gets the current logged-in user information.

**Example:**
```typescript
const user = this.authService.getCurrentUser();
console.log(user?.username);
```

#### `getCurrentUser$(): Observable<User | null>`
Observable stream of current user for reactive components.

**Example:**
```typescript
this.authService.getCurrentUser$().subscribe(user => {
  if (user) {
    console.log('User:', user.username);
  }
});
```

#### `hasRole(role: string): boolean`
Checks if current user has a specific role.

**Example:**
```typescript
if (this.authService.hasRole('ADMIN')) {
  // Show admin features
}
```

## AuthInterceptor

The `authInterceptor` automatically:
- Attaches JWT token to all outgoing HTTP requests (except `/auth/login` and `/auth/register`)
- Adds `Authorization: Bearer <token>` header
- Handles 401 Unauthorized responses by logging out and redirecting to login

**Note:** Already configured in `app.config.ts` - no additional setup required.

## Guards

### authGuard
Protects routes that require authentication. Redirects to login if not authenticated.

**Usage:**
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}
```

### noAuthGuard
Prevents authenticated users from accessing auth pages (login, register). Redirects to home if already logged in.

**Usage:**
```typescript
{
  path: 'login',
  component: LoginComponent,
  canActivate: [noAuthGuard]
}
```

### roleGuard
Checks if user has required role(s). Specify roles in route data.

**Usage:**
```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] }
}
```

## Integration Examples

### Using AuthService in a Component

```typescript
import { Component, inject, signal } from '@angular/core';
import { AuthService, User } from '@/app/core';

@Component({
  selector: 'app-profile',
  template: `
    <div>
      @if (user()) {
        <h2>Welcome, {{ user()?.username }}</h2>
        <p>Email: {{ user()?.email }}</p>
        <p>Role: {{ user()?.role }}</p>
        <button (click)="logout()">Logout</button>
      }
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  user = signal<User | null>(null);

  constructor() {
    this.authService.getCurrentUser$().subscribe(user => {
      this.user.set(user);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
```

### Protected Route Configuration

```typescript
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, roleGuard } from '@/app/core';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component'),
    canActivate: [noAuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component'),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  }
];
```

## Storage

The AuthService uses `localStorage` to persist:
- `auth_token`: JWT token
- `current_user`: User information (JSON string)

## Security Considerations

1. **Token Expiration**: Tokens are validated for expiration before considering user as authenticated
2. **Automatic Logout**: 401 responses automatically trigger logout
3. **Secure Storage**: Consider using more secure storage for production (e.g., httpOnly cookies)
4. **XSS Protection**: Ensure proper input sanitization throughout the application

## Backend API Expectations

The AuthService expects the following endpoints:

### POST `/api/auth/login`
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

### POST `/api/auth/logout`
**Request:** Empty body
**Response:** Success status

## Testing

Example test for AuthService:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for unauthenticated user', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });
});
```

## Next Steps

With the core authentication infrastructure in place, you can now:
1. Create authentication feature module (login/register components)
2. Create protected feature modules (dashboard, documents, etc.)
3. Implement additional services for documents and notifications
4. Add error handling and user feedback mechanisms
