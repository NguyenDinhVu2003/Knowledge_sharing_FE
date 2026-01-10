import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Component that redirects users to appropriate pages based on their role
 */
@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: '<p>Redirecting...</p>'
})
export class RoleRedirectComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      // Not authenticated, go to login
      this.router.navigate(['/auth/login']);
      return;
    }

    if (currentUser.role === 'ADMIN') {
      // Admin goes to admin dashboard
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Employee goes to home
      this.router.navigate(['/home']);
    }
  }
}
