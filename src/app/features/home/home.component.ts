import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h1>Welcome to Knowledge Sharing Platform</h1>
      @if (currentUser) {
        <div class="user-info">
          <p>Hello, <strong>{{ currentUser.username }}</strong>!</p>
          <p>Role: <span class="role-badge">{{ currentUser.role }}</span></p>
          <p>Email: {{ currentUser.email }}</p>
        </div>
        <button class="logout-button" (click)="logout()">Logout</button>
      }
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 40px;
      text-align: center;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    h1 {
      color: #667eea;
      margin-bottom: 30px;
    }

    .user-info {
      margin: 30px 0;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .user-info p {
      margin: 10px 0;
      font-size: 1.1rem;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .logout-button {
      padding: 12px 32px;
      font-size: 1rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .logout-button:hover {
      background: #c82333;
    }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser: User | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // If not authenticated, redirect to login
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
