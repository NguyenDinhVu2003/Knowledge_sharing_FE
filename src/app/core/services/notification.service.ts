import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { delay, tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  // State management
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription: any;

  // Mock data
  private mockNotifications: Notification[] = [
    {
      id: 1,
      userId: 1,
      documentId: 5,
      message: 'New document "Spring Boot Security" matches your interests in Security, Backend',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      document: {
        id: 5,
        title: 'Spring Boot Security',
        summary: 'Comprehensive guide to Spring Security',
        file_path: '/files/spring-security.pdf',
        file_type: 'PDF',
        file_size: 2048000,
        owner_id: 2,
        owner_name: 'Jane Smith',
        sharing_level: 'PUBLIC',
        version_number: 1,
        is_archived: false,
        average_rating: 4.5,
        created_at: '2025-12-16T08:00:00Z',
        updated_at: '2025-12-16T08:00:00Z',
        tags: ['Security', 'Backend', 'Spring Boot']
      }
    },
    {
      id: 2,
      userId: 1,
      documentId: 3,
      message: 'Document "RxJS Operators Handbook" you favorited was updated',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      document: {
        id: 3,
        title: 'RxJS Operators Handbook',
        summary: 'Complete RxJS operators reference',
        file_path: '/files/rxjs-operators.pdf',
        file_type: 'PDF',
        file_size: 1843200,
        owner_id: 1,
        owner_name: 'John Doe',
        sharing_level: 'PUBLIC',
        version_number: 2,
        is_archived: false,
        average_rating: 4.7,
        created_at: '2025-12-12T11:00:00Z',
        updated_at: '2025-12-16T10:00:00Z',
        tags: ['RxJS', 'Angular', 'Reactive Programming']
      }
    },
    {
      id: 3,
      userId: 1,
      documentId: 1,
      message: 'Your document "Angular Best Practices 2025" received a 5-star rating',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      document: {
        id: 1,
        title: 'Angular Best Practices 2025',
        summary: 'Modern Angular development guide',
        file_path: '/files/angular-2025.pdf',
        file_type: 'PDF',
        file_size: 2048000,
        owner_id: 1,
        owner_name: 'John Doe',
        sharing_level: 'PUBLIC',
        version_number: 1,
        is_archived: false,
        average_rating: 4.8,
        created_at: '2025-12-14T10:30:00Z',
        updated_at: '2025-12-14T10:30:00Z',
        tags: ['Angular', 'Frontend', 'Best Practices']
      }
    },
    {
      id: 4,
      userId: 1,
      documentId: 7,
      message: 'New document "Docker Compose Tutorial" matches your interests in DevOps',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      id: 5,
      userId: 1,
      documentId: 8,
      message: 'Document "TypeScript Advanced Types" you favorited was updated',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
    {
      id: 6,
      userId: 1,
      documentId: 2,
      message: 'Your document "REST API Design Patterns" received a 4-star rating',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
    {
      id: 7,
      userId: 1,
      documentId: 10,
      message: 'New document "MongoDB Aggregation Pipeline" matches your interests in Database',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      id: 8,
      userId: 1,
      documentId: 11,
      message: 'Document "Redis Caching Strategies" you favorited was updated',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
    {
      id: 9,
      userId: 1,
      documentId: 4,
      message: 'Your document "Microservices Architecture" received a comment',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    },
    {
      id: 10,
      userId: 1,
      documentId: 12,
      message: 'New document "Kubernetes Deployment Guide" matches your interests in DevOps, Cloud',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    }
  ];

  /**
   * Get all notifications for current user
   * GET /api/notifications
   * Returns: array of notifications (newest first)
   */
  getNotifications(): Observable<Notification[]> {
    // MOCK IMPLEMENTATION
    return of([...this.mockNotifications]).pipe(
      delay(300),
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(err => {
        console.error('Failed to load notifications', err);
        return of([]);
      })
    );

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(err => {
        console.error('Failed to load notifications', err);
        return of([]);
      })
    );
    */
  }

  /**
   * Get unread notifications only
   */
  getUnreadNotifications(): Observable<Notification[]> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.isRead))
    );
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/{id}/read
   */
  markAsRead(notificationId: number): Observable<void> {
    // MOCK IMPLEMENTATION
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notificationsSubject.next([...this.mockNotifications]);
      this.updateUnreadCount();
    }
    return of(void 0).pipe(delay(200));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value;
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this.notificationsSubject.next([...notifications]);
          this.updateUnreadCount();
        }
      }),
      catchError(err => {
        console.error('Failed to mark notification as read', err);
        return of(void 0);
      })
    );
    */
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  markAllAsRead(): Observable<void> {
    // MOCK IMPLEMENTATION
    this.mockNotifications.forEach(n => n.isRead = true);
    this.notificationsSubject.next([...this.mockNotifications]);
    this.updateUnreadCount();
    return of(void 0).pipe(delay(300));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(err => {
        console.error('Failed to mark all as read', err);
        return of(void 0);
      })
    );
    */
  }

  /**
   * Get unread count (for badge)
   * GET /api/notifications/unread-count
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  /**
   * Delete notification
   * DELETE /api/notifications/{id}
   */
  deleteNotification(notificationId: number): Observable<void> {
    // MOCK IMPLEMENTATION
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.mockNotifications.splice(index, 1);
      this.notificationsSubject.next([...this.mockNotifications]);
      this.updateUnreadCount();
    }
    return of(void 0).pipe(delay(200));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      }),
      catchError(err => {
        console.error('Failed to delete notification', err);
        return of(void 0);
      })
    );
    */
  }

  /**
   * Clear all notifications
   * DELETE /api/notifications/all
   */
  clearAllNotifications(): Observable<void> {
    // MOCK IMPLEMENTATION
    this.mockNotifications = [];
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    return of(void 0).pipe(delay(300));

    /* ACTUAL API IMPLEMENTATION - Uncomment when backend is ready
    return this.http.delete<void>(`${this.apiUrl}/all`).pipe(
      tap(() => {
        this.notificationsSubject.next([]);
        this.updateUnreadCount();
      }),
      catchError(err => {
        console.error('Failed to clear all notifications', err);
        return of(void 0);
      })
    );
    */
  }

  /**
   * Refresh notifications (useful for polling)
   */
  refreshNotifications(): void {
    this.getNotifications().subscribe();
  }

  /**
   * Start polling for new notifications (every 30 seconds)
   */
  startPolling(): void {
    // Stop existing polling if any
    this.stopPolling();

    // Initial load
    this.refreshNotifications();

    // Poll every 30 seconds
    this.pollingSubscription = interval(30000).pipe(
      switchMap(() => this.getNotifications())
    ).subscribe();
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }
}
