import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { UserManagement } from '../../../core/models/admin.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private confirmDialog = inject(ConfirmDialogService);

  users: UserManagement[] = [];
  loading = true;
  displayedColumns: string[] = ['username', 'email', 'role', 'documents', 'ratings', 'favorites', 'created', 'lastActivity', 'actions'];
  
  currentUserId: number | null = null;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.cdr.detectChanges();
        
        if (error.status === 403) {
          this.snackBar.open('Access denied - Admin role required', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
        }
      }
    });
  }

  changeUserRole(user: UserManagement, newRole: 'EMPLOYEE' | 'ADMIN'): void {
    if (user.id === this.currentUserId) {
      this.snackBar.open('Cannot change your own role', 'Close', { duration: 3000 });
      return;
    }

    const description = newRole === 'ADMIN' 
      ? 'This will grant admin privileges' 
      : 'This will remove admin privileges';

    this.confirmDialog.confirmRoleChange(user.username, newRole, description)
      .subscribe(confirmed => {
        if (!confirmed) return;

        this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        this.loadUsers(); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        const errorMsg = error.error?.message || 'Failed to update user role';
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
      }
    });
      });
  }

  deleteUser(user: UserManagement): void {
    if (user.id === this.currentUserId) {
      this.snackBar.open('Cannot delete yourself', 'Close', { duration: 3000 });
      return;
    }

    const details = [
      'User account',
      `${user.documentCount} documents`,
      `${user.ratingCount} ratings`,
      `${user.favoriteCount} favorites`,
      'All related data'
    ];

    this.confirmDialog.confirm({
      title: `Delete user "${user.username}"?`,
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      details: details,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).subscribe(confirmed => {
      if (!confirmed) return;

      this.adminService.deleteUser(user.id).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Close', { duration: 3000 });
        this.loadUsers(); // Reload to remove deleted user
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        const errorMsg = error.error?.message || 'Failed to delete user';
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
      }
    });
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-employee';
  }
}
