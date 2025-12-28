import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Document, DocumentVersion } from '../../../core/models/document.model';
import { Rating, RatingStats } from '../../../core/models/rating.model';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { RatingService } from '../../../core/services/rating.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../../shared/components/document-card/document-card.component';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent
  ],
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit {
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private ratingService = inject(RatingService);
  private favoriteService = inject(FavoriteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  document: Document | null = null;
  versions: DocumentVersion[] = [];
  relatedDocuments: Document[] = [];
  loading = true;
  versionsLoading = false;
  relatedLoading = false;
  safeFileUrl: SafeResourceUrl | null = null;
  
  userRating = 0;
  ratingStats: RatingStats | null = null;
  ratingStars = [1, 2, 3, 4, 5];
  isOwner = false;
  isFavorited = false;

  ngOnInit(): void {
    // Subscribe to route params to reload when navigating back from edit
    this.route.params.subscribe(params => {
      const docId = params['id'];
      if (docId) {
        this.loadDocument(parseInt(docId));
      }
    });
  }

  loadDocument(id: number): void {
    console.log('loadDocument started, setting loading = true');
    this.loading = true;
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        console.log('Document received in component:', doc.title);
        console.log('Setting document and loading = false');
        this.document = doc;
        this.loading = false; // Set loading to false
        this.cdr.detectChanges(); // Force change detection
        console.log('After setting: loading =', this.loading, 'document =', this.document?.title);
        
        // Check if current user is owner
        const currentUser = this.authService.getCurrentUser();
        this.isOwner = currentUser?.id === doc.ownerId;
        
        // Load related data
        this.loadVersions(id);
       // this.loadRelatedDocuments(id);
        this.loadMyRating(id);
        this.loadRatingStats(id);
        
        // Create safe URL for preview
        if (doc.filePath) {
          this.createSafeUrl(doc.filePath);
        }
        
        // Check if favorited (mock - would check against user's favorites)
        this.checkFavoriteStatus(id);
      },
      error: (error) => {
        console.error('Error loading document:', error);
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection on error too
        this.snackBar.open('Failed to load document', 'Close', { duration: 3000 });
        this.router.navigate(['/documents']);
      }
    });
  }

  loadVersions(docId: number): void {
    this.versionsLoading = true;
    this.documentService.getDocumentVersions(docId).subscribe({
      next: (versions) => {
        // Only show the latest version
        this.versions = versions.length > 0 ? [versions[0]] : [];
        this.versionsLoading = false;
      },
      error: (error) => {
        console.error('Error loading versions:', error);
        this.versionsLoading = false;
      }
    });
  }

  loadRelatedDocuments(docId: number): void {
    this.relatedLoading = true;
    this.documentService.getRelatedDocuments(docId).subscribe({
      next: (docs) => {
        this.relatedDocuments = docs;
        this.relatedLoading = false;
      },
      error: (error) => {
        console.error('Error loading related documents:', error);
        this.relatedLoading = false;
      }
    });
  }

  createSafeUrl(filePath: string): void {
    // For preview, sanitize the URL
    this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filePath);
  }

  checkFavoriteStatus(docId: number): void {
    this.favoriteService.isFavorited(docId).subscribe({
      next: (favorited) => {
        this.isFavorited = favorited;
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
      }
    });
  }

  loadMyRating(docId: number): void {
    this.ratingService.getMyRating(docId).subscribe({
      next: (rating) => {
        this.userRating = rating?.ratingValue || 0;
      },
      error: (error) => {
        console.error('Error loading my rating:', error);
      }
    });
  }

  loadRatingStats(docId: number): void {
    this.ratingService.getRatingStats(docId).subscribe({
      next: (stats) => {
        this.ratingStats = stats;
      },
      error: (error) => {
        console.error('Error loading rating stats:', error);
      }
    });
  }

  rateDocument(rating: number): void {
    if (!this.document) return;
    
    this.ratingService.rateDocument(this.document.id, rating).subscribe({
      next: (ratingResponse) => {
        this.userRating = ratingResponse.ratingValue;
        this.snackBar.open(`Rated ${rating} stars`, 'Close', { duration: 2000 });
        // Reload stats to get updated average
        this.loadRatingStats(this.document!.id);
      },
      error: (error) => {
        console.error('Error rating document:', error);
        this.snackBar.open('Failed to rate document', 'Close', { duration: 3000 });
      }
    });
  }

  deleteRating(): void {
    if (!this.document) return;
    
    this.ratingService.deleteRating(this.document.id).subscribe({
      next: () => {
        this.userRating = 0;
        this.snackBar.open('Rating removed', 'Close', { duration: 2000 });
        // Reload stats
        this.loadRatingStats(this.document!.id);
      },
      error: (error) => {
        console.error('Error deleting rating:', error);
        this.snackBar.open('Failed to remove rating', 'Close', { duration: 3000 });
      }
    });
  }

  toggleFavorite(): void {
    if (!this.document) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Please login to manage favorites', 'Close', { duration: 3000 });
      return;
    }
    
    if (this.isFavorited) {
      // Remove from favorites using documentId
      this.favoriteService.removeFavorite(this.document.id).subscribe({
        next: () => {
          this.isFavorited = false;
          const snackBarRef = this.snackBar.open('Removed from favorites', 'Undo', { duration: 3000 });
          
          snackBarRef.onAction().subscribe(() => {
            if (this.document) {
              this.addToFavorites(this.document);
            }
          });
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          this.snackBar.open('Failed to remove from favorites', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Add to favorites
      this.addToFavorites(this.document);
    }
  }

  private addToFavorites(document: Document): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    this.favoriteService.addFavorite(document.id).subscribe({
      next: () => {
        this.isFavorited = true;
        this.snackBar.open('Added to favorites', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error adding favorite:', error);
        this.snackBar.open('Failed to add to favorites', 'Close', { duration: 3000 });
      }
    });
  }

  downloadDocument(): void {
    if (!this.document) return;
    
    // Mock implementation - would trigger actual download in real app
    this.snackBar.open('Download started...', 'Close', { duration: 2000 });
    
    // In real app, would use:
    // window.open(this.document.file_path, '_blank');
  }

  editDocument(): void {
    if (this.document) {
      this.router.navigate(['/documents', this.document.id, 'edit']);
    }
  }

  deleteDocument(): void {
    if (!this.document) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${this.document.title}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      this.documentService.deleteDocument(this.document.id).subscribe({
        next: () => {
          this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/documents']);
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.snackBar.open('Failed to delete document', 'Close', { duration: 3000 });
        }
      });
    }
  }

  canPreview(): boolean {
    if (!this.document || !this.document.filePath) return false;
    const ext = this.document.filePath.split('.').pop()?.toLowerCase();
    return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '');
  }

  isImage(): boolean {
    if (!this.document || !this.document.filePath) return false;
    const ext = this.document.filePath.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '');
  }

  isPdf(): boolean {
    if (!this.document || !this.document.filePath) return false;
    const ext = this.document.filePath.split('.').pop()?.toLowerCase();
    return ext === 'pdf';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
