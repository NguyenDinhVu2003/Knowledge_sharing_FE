import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../../core/services/admin.service';
import { SystemStatistics } from '../../../core/models/admin.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  statistics: SystemStatistics | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadStatistics();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.loadStatistics();
    }, 5 * 60 * 1000);
  }

  loadStatistics(): void {
    this.loading = true;
    this.adminService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
        this.cdr.detectChanges();
        
        if (error.status === 403) {
          this.snackBar.open('Access denied - Admin role required', 'Close', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          this.snackBar.open('Failed to load statistics', 'Close', { duration: 3000 });
        }
      }
    });
  }

  refreshStatistics(): void {
    this.loadStatistics();
  }

  navigateToUserManagement(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToGroupManagement(): void {
    this.router.navigate(['/admin/groups']);
  }

  navigateToUserGroupManagement(): void {
    this.router.navigate(['/admin/user-groups']);
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getObjectEntries(obj: any): [string, any][] {
    return Object.entries(obj || {});
  }
}
