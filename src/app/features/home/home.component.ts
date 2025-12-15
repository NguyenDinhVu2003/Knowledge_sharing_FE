import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';

// Material Modules
import { MatButtonModule } from '@angular/material/button';

// Core Services and Models
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { User, Document } from '../../core/models';

// Shared Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  
  recentDocuments$!: Observable<Document[]>;
  popularDocuments$!: Observable<Document[]>;
  userDocuments$!: Observable<Document[]>;
  currentUser$!: Observable<User | null>;
  unreadCount$: Observable<number> = of(0); // Will be implemented with NotificationService later
  
  currentUser: User | null = null;

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.authService.getCurrentUser();
    this.currentUser$ = of(this.currentUser);
    
    // If not authenticated, redirect to login
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Load documents
    this.recentDocuments$ = this.documentService.getRecentDocuments(5);
    this.popularDocuments$ = this.documentService.getPopularDocuments(5);
    this.userDocuments$ = this.documentService.getUserDocuments(5);
  }

  /**
   * Navigate to document detail page
   * @param documentId - ID of the document to view
   */
  navigateToDocument(documentId: number): void {
    console.log('Navigating to document:', documentId);
    this.router.navigate(['/documents', documentId]);
  }

  /**
   * Handle action clicks from document cards
   */
  onActionClicked(event: { action: string; documentId: number }): void {
    console.log('Home - Action clicked:', event);
    switch (event.action) {
      case 'view':
        this.router.navigate(['/documents', event.documentId]);
        break;
      case 'edit':
        this.router.navigate(['/documents', event.documentId, 'edit']);
        break;
      case 'delete':
        console.log('Delete document:', event.documentId);
        // TODO: Implement delete with confirmation dialog
        break;
    }
  }

  /**
   * Handle logout action from header
   */
  onLogout(): void {
    this.authService.logout();
  }
}
