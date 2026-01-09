import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  protected readonly title = signal('Knowledge Sharing Platform');
  showHeader = signal(true);

  ngOnInit() {
    // Hide header on auth pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showHeader.set(!event.url.includes('/auth/'));
    });

    // Don't check authentication here - let the guards handle it
    // This prevents race conditions when refreshing the page
    // Guards will check authentication before allowing access to protected routes
  }
}
