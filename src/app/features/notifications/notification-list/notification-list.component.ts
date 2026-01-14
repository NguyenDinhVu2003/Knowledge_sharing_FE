import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable, map, filter } from 'rxjs';
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
import { NotificationWebSocketService } from '../../../core/services/notification-websocket.service';
import { Notification as NotificationModel } from '../../../core/models/notification.model';
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
  private wsService = inject(NotificationWebSocketService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  notifications$!: Observable<NotificationModel[]>;
  unreadCount$!: Observable<number>;
  filterMode: 'all' | 'unread' = 'all';
  filteredNotifications$!: Observable<NotificationModel[]>;
  loading: boolean = true;

  ngOnInit(): void {
    this.loadNotifications();
    
    // Subscribe to unread count from service
    this.unreadCount$ = this.notificationService.getUnreadCount();
    
    // Subscribe to real-time notifications via WebSocket
    // Only show snackbar when NOT on notifications page
    this.wsService.getNotifications().subscribe(notification => {
      if (notification) {
        console.log('🔔 New real-time notification received:', notification);
        
        // Check if currently on notifications page
        const isOnNotificationsPage = this.router.url.includes('/notifications');
        
        if (!isOnNotificationsPage) {
          // Show browser notification
          this.showBrowserNotification(notification);
          
          // Play notification sound
          this.playNotificationSound();
          
          // Show styled snackbar with custom CSS
          const snackBarRef = this.snackBar.open(
            notification.message, 
            'View', 
            {
              duration: 6000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['custom-notification-snackbar']
            }
          );
          
          snackBarRef.onAction().subscribe(() => {
            if (notification.documentId) {
              this.router.navigate(['/documents', notification.documentId]);
            }
          });
        } else {
          // If on notifications page, just reload the list silently
          console.log('🔔 On notifications page, reloading list silently...');
        }
        
        // Always reload notifications list and count
        this.loadNotifications();
        this.unreadCount$ = this.notificationService.getUnreadCount();
      }
    });
    
    // Debug: Log unread count changes
    this.unreadCount$.subscribe(count => {
      console.log('=== NotificationListComponent: Unread count changed to:', count);
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Load notifications
   */
  loadNotifications(): void {
    console.log('=== NotificationListComponent: loadNotifications called');
    this.loading = true;
    this.notifications$ = this.notificationService.getNotifications();
    
    this.notifications$.subscribe({
      next: (notifications) => {
        console.log('=== NotificationListComponent: Received', notifications.length, 'notifications');
        
        // Debug: Log first notification's createdAt
        if (notifications.length > 0) {
          const firstNotif = notifications[0];
          console.log('=== First notification createdAt:', firstNotif.createdAt);
          console.log('=== Type:', typeof firstNotif.createdAt);
          console.log('=== Parsed date:', new Date(firstNotif.createdAt));
          console.log('=== Current time:', new Date());
        }
        
        this.loading = false;
        this.applyFilter();
      },
      error: (err) => {
        console.error('=== NotificationListComponent: Error loading notifications:', err);
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
  markAsRead(notification: NotificationModel): void {
    if (notification.isRead) {
      // Already read, just navigate
      if (notification.documentId) {
        this.navigateToDocument(notification.documentId);
      }
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        if (notification.documentId) {
          this.navigateToDocument(notification.documentId);
        }
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
  deleteNotification(notification: NotificationModel): void {
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
      return 'description';
    } else if (message.toLowerCase().includes('updated')) {
      return 'update';
    } else if (message.toLowerCase().includes('rating') || message.toLowerCase().includes('rated')) {
      return 'star';
    } else if (message.toLowerCase().includes('comment')) {
      return 'comment';
    }
    return 'notifications';
  }

  /**
   * Show browser notification (optional)
   */
  private showBrowserNotification(notification: any): void {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('New Notification', {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('New Notification', {
            body: notification.message,
            icon: '/assets/icons/notification-icon.png'
          });
        }
      });
    }
  }

  /**
   * Play notification sound (optional)
   */
  private playNotificationSound(): void {
    try {
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => {
        console.log('Could not play sound:', err);
      });
    } catch (error) {
      console.log('Sound playback not available:', error);
    }
  }
}
