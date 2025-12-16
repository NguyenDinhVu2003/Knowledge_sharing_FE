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

    // Check authentication on app start
    if (!this.authService.isAuthenticated() && !this.router.url.includes('/auth')) {
      this.router.navigate(['/auth/login']);
    }
  }
}
