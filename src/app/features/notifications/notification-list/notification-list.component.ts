import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent,
    TimeAgoPipe
  ],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  notifications$!: Observable<Notification[]>;
  unreadCount$!: Observable<number>;
  filterMode: 'all' | 'unread' = 'all';
  filteredNotifications$!: Observable<Notification[]>;
  loading: boolean = true;

  ngOnInit(): void {
    this.loadNotifications();
    this.unreadCount$ = this.notificationService.getUnreadCount();
    
    // Start polling for new notifications
    this.notificationService.startPolling();
  }

  ngOnDestroy(): void {
    // Stop polling to prevent memory leaks
    this.notificationService.stopPolling();
  }

  /**
   * Load notifications
   */
  loadNotifications(): void {
    this.loading = true;
    this.notifications$ = this.notificationService.getNotifications();
    
    this.notifications$.subscribe({
      next: () => {
        this.loading = false;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.loading = false;
        this.snackBar.open('Failed to load notifications', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Apply filter based on filter mode
   */
  applyFilter(): void {
    if (this.filterMode === 'unread') {
      this.filteredNotifications$ = this.notifications$.pipe(
        map(notifications => notifications.filter(n => !n.isRead))
      );
    } else {
      this.filteredNotifications$ = this.notifications$;
    }
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.applyFilter();
  }

  /**
   * Mark notification as read and navigate to document
   */
  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      // Already read, just navigate
      this.navigateToDocument(notification.documentId);
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.navigateToDocument(notification.documentId);
      },
      error: (err) => {
        console.error('Error marking as read:', err);
        this.snackBar.open('Failed to mark as read', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.snackBar.open('All notifications marked as read', 'Close', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
        this.snackBar.open('Failed to mark all as read', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Delete notification with confirmation
   */
  deleteNotification(notification: Notification): void {
    const confirmed = window.confirm('Are you sure you want to delete this notification?');
    if (confirmed) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          this.snackBar.open('Notification deleted', 'Close', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        },
        error: (err) => {
          console.error('Error deleting notification:', err);
          this.snackBar.open('Failed to delete notification', 'Close', { duration: 3000 });
        }
      });
    }
  }

  /**
   * Clear all notifications with confirmation
   */
  clearAll(): void {
    const confirmed = window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.');
    if (confirmed) {
      this.notificationService.clearAllNotifications().subscribe({
        next: () => {
          this.snackBar.open('All notifications cleared', 'Close', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        },
        error: (err) => {
          console.error('Error clearing notifications:', err);
          this.snackBar.open('Failed to clear notifications', 'Close', { duration: 3000 });
        }
      });
    }
  }

  /**
   * Navigate to document detail page
   */
  navigateToDocument(documentId: number): void {
    this.router.navigate(['/documents', documentId]);
  }

  /**
   * Get notification icon based on message content
   */
  getNotificationIcon(message: string): string {
    if (message.toLowerCase().includes('new document')) {
      return 'fiber_new';
    } else if (message.toLowerCase().includes('updated')) {
      return 'update';
    } else if (message.toLowerCase().includes('rating') || message.toLowerCase().includes('rated')) {
      return 'star';
    } else if (message.toLowerCase().includes('comment')) {
      return 'comment';
    }
    return 'notifications';
  }
}
