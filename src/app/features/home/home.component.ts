import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Core Services and Models
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { User, Document } from '../../core/models';

// Shared Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
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
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  
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

    // Load documents from backend API
    // GET /api/documents?sort=recent&limit=10
    this.recentDocuments$ = this.documentService.getRecentDocuments(10);
    
    // GET /api/documents?sort=popular&limit=10
    this.popularDocuments$ = this.documentService.getPopularDocuments(10);
    
    // GET /api/documents?owner=me
    this.userDocuments$ = this.documentService.getUserDocuments();
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
    switch (event.action) {
      case 'view':
        this.router.navigate(['/documents', event.documentId]);
        break;
      case 'edit':
        this.router.navigate(['/documents', event.documentId, 'edit']);
        break;
      case 'delete':
        this.confirmAndDelete(event.documentId);
        break;
    }
  }

  confirmAndDelete(documentId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Document',
        message: 'Are you sure you want to delete this document? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentService.deleteDocument(documentId).subscribe({
          next: () => {
            this.snackBar.open('Document deleted successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            // Reload all document lists
            this.recentDocuments$ = this.documentService.getRecentDocuments(5);
            this.popularDocuments$ = this.documentService.getPopularDocuments(5);
            this.userDocuments$ = this.documentService.getUserDocuments(5);
          },
          error: (err) => {
            console.error('Error deleting document:', err);
            this.snackBar.open('Failed to delete document', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  /**
   * Handle logout action from header
   */
  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
