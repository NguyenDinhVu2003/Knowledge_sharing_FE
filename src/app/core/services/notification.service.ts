import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, interval, Subscription } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification, NotificationCountResponse, MessageResponse } from '../models/notification.model';

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

  private pollingSubscription: Subscription | null = null;

  /**
   * Get all notifications for current user
   * GET /api/notifications
   */
  getNotifications(): Observable<Notification[]> {
    console.log('=== NotificationService: Calling GET', this.apiUrl);
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        console.log('=== NotificationService: Received', notifications.length, 'notifications');
        this.notificationsSubject.next(notifications);
        this.updateUnreadCountFromList(notifications);
      }),
      catchError(err => {
        console.error('=== NotificationService: Failed to load notifications', err);
        return of([]);
      })
    );
  }

  /**
   * Get unread notifications only
   * GET /api/notifications/unread
   */
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`).pipe(
      catchError(err => {
        console.error('Failed to load unread notifications', err);
        return of([]);
      })
    );
  }

  /**
   * Fetch unread count from API (for badge)
   * GET /api/notifications/unread/count
   */
  fetchUnreadCount(): Observable<number> {
    return this.http.get<NotificationCountResponse>(`${this.apiUrl}/unread/count`).pipe(
      map(response => response.count),
      tap(count => this.unreadCountSubject.next(count)),
      catchError(err => {
        console.error('Failed to get unread count', err);
        return of(0);
      })
    );
  }

  /**
   * Get unread count observable (from cache/subject)
   * Use this for template binding to avoid API calls
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/{id}/read
   */
  markAsRead(notificationId: number): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.isRead = true;
          this.notificationsSubject.next([...notifications]);
          this.updateUnreadCountFromList(notifications);
        }
      }),
      catchError(err => {
        console.error('Failed to mark notification as read', err);
        throw err;
      })
    );
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  markAllAsRead(): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
      }),
      catchError(err => {
        console.error('Failed to mark all as read', err);
        throw err;
      })
    );
  }

  /**
   * Delete notification
   * DELETE /api/notifications/{id}
   */
  deleteNotification(notificationId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCountFromList(notifications);
      }),
      catchError(err => {
        console.error('Failed to delete notification', err);
        throw err;
      })
    );
  }

  /**
   * Clear all notifications
   * DELETE /api/notifications/all
   */
  clearAllNotifications(): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/all`).pipe(
      tap(() => {
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }),
      catchError(err => {
        console.error('Failed to clear all notifications', err);
        throw err;
      })
    );
  }

  /**
   * Refresh notifications (fetch from API)
   */
  refreshNotifications(): void {
    this.getNotifications().subscribe();
  }

  /**
   * Start polling for new notifications (every 30 seconds)
   * Only call this on notifications page, NOT in header
   */
  startPolling(): void {
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
   * Update unread count from notifications list
   */
  private updateUnreadCountFromList(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    console.log('=== NotificationService: Updating unread count:', unreadCount, 'from', notifications.length, 'total notifications');
    console.log('=== Unread notifications:', notifications.filter(n => !n.isRead).map(n => ({ id: n.id, message: n.message, isRead: n.isRead })));
    this.unreadCountSubject.next(unreadCount);
  }
}
