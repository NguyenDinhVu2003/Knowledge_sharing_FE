import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
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

  @Input() unreadNotifications: number = 0;
  @Input() currentUser: User | null = null;
  
  @Output() logoutClicked = new EventEmitter<void>();

  // Favorite count
  favoriteCount$!: Observable<number>;

  // Notification count
  unreadNotificationCount$!: Observable<number>;

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
      this.favoriteCount$ = this.favoriteService.getFavoriteCount();
      this.unreadNotificationCount$ = this.notificationService.getUnreadCount();
    }
    
    // CRITICAL: Do NOT call any API here to fetch notification count
    // This was causing NG0100 errors and 15-20s load times on document detail page
    // The notification count badge will show 0 initially, and will be updated
    // only when user visits /notifications page
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
