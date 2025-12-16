import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../core/models';
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
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
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

  ngOnInit(): void {
    this.favoriteCount$ = this.favoriteService.getFavoriteCount();
    this.unreadNotificationCount$ = this.notificationService.getUnreadCount();
    
    // Start polling for notifications
    this.notificationService.startPolling();
  }

  ngOnDestroy(): void {
    // Stop polling when component destroyed
    this.notificationService.stopPolling();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onLogout(): void {
    this.logoutClicked.emit();
  }
}
