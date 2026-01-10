import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationWebSocketService } from '../../../core/services/notification-websocket.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private favoriteService = inject(FavoriteService);
  private notificationService = inject(NotificationService);
  private wsService = inject(NotificationWebSocketService);
  private cdr = inject(ChangeDetectorRef);

  @Input() unreadNotifications: number = 0;
  @Input() currentUser: User | null = null;
  
  @Output() logoutClicked = new EventEmitter<void>();

  // Favorite count
  favoriteCount$!: Observable<number>;

  // Notification count - using BehaviorSubject for real-time updates
  private unreadNotificationCountSubject = new BehaviorSubject<number>(0);
  unreadNotificationCount$ = this.unreadNotificationCountSubject.asObservable();

  // Mobile menu state
  mobileMenuOpen = signal(false);
  
  // Cache admin status as signal to prevent infinite change detection
  isAdmin = signal<boolean>(false);

  ngOnInit(): void {
    // Nếu currentUser không được truyền vào, tự động lấy từ AuthService
    if (!this.currentUser) {
      this.currentUser = this.authService.getCurrentUser();
    }
    
    // Cache admin status to avoid repeated getter calls
    this.isAdmin.set(this.currentUser?.role === 'ADMIN');
    
    // Only load counts for non-admin users
    if (!this.isAdmin()) {
      console.log('🎯 Header: Initializing notification counts for user:', this.currentUser?.id);
      this.favoriteCount$ = this.favoriteService.getFavoriteCount();
      
      // Load initial unread count from API
      this.notificationService.getUnreadCount().subscribe(count => {
        console.log('📊 Header: Initial unread count from API:', count);
        this.unreadNotificationCountSubject.next(count);
      });
      
      // Wait for WebSocket to connect, then subscribe to updates
      console.log('🔌 Header: Waiting for WebSocket connection...');
      this.wsService.isConnected().pipe(
        filter(connected => connected),
        tap(() => console.log('✅ Header: WebSocket connected, subscribing to updates...')),
        switchMap(() => this.wsService.getUnreadCount())
      ).subscribe(count => {
        console.log('🔔 Header: WebSocket unread count update received:', count);
        console.log('🔔 Header: Current badge value before update:', this.unreadNotificationCountSubject.value);
        // Update the BehaviorSubject to trigger UI update
        this.unreadNotificationCountSubject.next(count);
        console.log('🔔 Header: Badge value updated to:', this.unreadNotificationCountSubject.value);
        // Force change detection for OnPush strategy
        this.cdr.markForCheck();
        console.log('✅ Header: Change detection marked');
      });
      
      // Subscribe to new notifications (also wait for connection)
      this.wsService.isConnected().pipe(
        filter(connected => connected),
        switchMap(() => this.wsService.getNotifications())
      ).subscribe(notification => {
        if (notification) {
          console.log('🔔 Header: New notification detected, reloading count...');
          // Reload count from API when new notification arrives
          this.notificationService.getUnreadCount().subscribe(count => {
            console.log('📊 Header: Reloaded count from API:', count);
            this.unreadNotificationCountSubject.next(count);
            // Force change detection
            this.cdr.markForCheck();
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    // No polling to stop anymore
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onLogout(): void {
    // Nếu có listener từ parent component, emit event
    if (this.logoutClicked.observed) {
      this.logoutClicked.emit();
    } else {
      // Ngược lại, tự xử lý logout
      this.authService.logout().subscribe();
    }
  }
}
