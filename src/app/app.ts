import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { NotificationWebSocketService } from './core/services/notification-websocket.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private wsService = inject(NotificationWebSocketService);
  
  protected readonly title = signal('Knowledge Sharing Platform');
  showHeader = signal(true);

  ngOnInit() {
    // Hide header on auth pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showHeader.set(!event.url.includes('/auth/'));
    });

    // Connect WebSocket when user is logged in
    this.authService.currentUser$.pipe(
      filter(user => !!user)
    ).subscribe(user => {
      if (user && environment.wsEnabled) {
        const token = this.authService.getToken();
        if (token) {
          console.log('🚀 AppComponent: Connecting WebSocket for user:', user.id);
          this.wsService.connect(user.id, token);
          console.log('🚀 AppComponent: WebSocket connect() called');
        }
      }
    });

    // Disconnect when user logs out
    this.authService.currentUser$.pipe(
      filter(user => !user)
    ).subscribe(() => {
      console.log('🔌 AppComponent: Disconnecting WebSocket');
      this.wsService.disconnect();
    });

    // Don't check authentication here - let the guards handle it
    // This prevents race conditions when refreshing the page
    // Guards will check authentication before allowing access to protected routes
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
}
