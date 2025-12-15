import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  private favoriteService = inject(FavoriteService);

  @Input() unreadNotifications: number = 0;
  @Input() currentUser: User | null = null;
  
  @Output() logoutClicked = new EventEmitter<void>();

  // Favorite count
  favoriteCount$!: Observable<number>;

  // Mobile menu state
  mobileMenuOpen = signal(false);

  ngOnInit(): void {
    this.favoriteCount$ = this.favoriteService.getFavoriteCount();
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
