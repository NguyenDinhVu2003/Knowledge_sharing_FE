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

  // Preview flags - computed once to avoid NG0100 error
  canPreviewFile = false;
  isImageFile = false;
  isPdfFile = false;
  isOfficeFile = false; // DOC, DOCX, XLS, XLSX, PPT, PPTX

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
        
        // Update preview flags FIRST
        this.updatePreviewFlags();
        
        // Create safe URL BEFORE detectChanges
        if (doc.filePath) {
          this.createSafeUrl(doc.filePath);
        }
        
        this.loading = false;
        this.cdr.detectChanges();
        console.log('After setting: loading =', this.loading, 'document =', this.document?.title);
        
        // Check if current user is owner
        const currentUser = this.authService.getCurrentUser();
        this.isOwner = currentUser?.id === doc.ownerId;
        
        // Load related data
        this.loadVersions(id);
        this.loadRelatedDocuments(id);
        this.loadMyRating(id);
        this.loadRatingStats(id);
        
        // Check if favorited
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
    console.log('🔍 Loading related documents for docId:', docId);
    this.relatedLoading = true;
    this.documentService.getRelatedDocuments(docId, 5).subscribe({
      next: (docs) => {
        console.log('✅ Related documents API response:', docs);
        console.log('✅ Number of related documents:', docs.length);
        this.relatedDocuments = docs;
        this.relatedLoading = false;
        
        // Force change detection
        this.cdr.detectChanges();
        console.log('✅ relatedDocuments array updated:', this.relatedDocuments);
      },
      error: (error) => {
        console.error('❌ Error loading related documents:', error);
        this.relatedDocuments = [];
        this.relatedLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  createSafeUrl(filePath: string): void {
    console.log('=== createSafeUrl called with:', filePath);
    
    // If filePath is relative, convert to absolute URL
    let fullUrl = filePath;
    if (filePath && !filePath.startsWith('http')) {
      // Ensure filePath starts with /
      const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
      // Assume files are served from backend
      fullUrl = `http://localhost:8090${normalizedPath}`;
      console.log('=== Converted relative path to:', fullUrl);
    }
    
    // For Office files, use Microsoft Office Online Viewer
    if (this.isOfficeFile) {
      // Encode the file URL for Office viewer
      const encodedUrl = encodeURIComponent(fullUrl);
      fullUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
      console.log('=== Using Office viewer:', fullUrl);
    }
    
    // For preview, sanitize the URL
    this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
    console.log('=== safeFileUrl created');
  }

  /**
   * Update preview flags based on current document
   * Called once when document is loaded to avoid NG0100 error
   */
  private updatePreviewFlags(): void {
    if (!this.document) {
      this.canPreviewFile = false;
      this.isImageFile = false;
      this.isPdfFile = false;
      this.isOfficeFile = false;
      console.log('=== updatePreviewFlags: No document');
      return;
    }

    // Use fileType from backend first, then fallback to extension detection
    const fileType = this.document.fileType?.toUpperCase();
    let ext = '';
    
    if (this.document.filePath) {
      const parts = this.document.filePath.split('.');
      ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }
    
    console.log('=== updatePreviewFlags:', {
      fileType: fileType,
      filePath: this.document.filePath,
      extension: ext
    });
    
    // Check if it's an image
    this.isImageFile = fileType === 'IMAGE' || 
                       ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp'].includes(ext);
    
    // Check if it's a PDF
    this.isPdfFile = fileType === 'PDF' || ext === 'pdf';
    
    // Check if it's an Office file (DOC, DOCX, XLS, XLSX, PPT, PPTX)
    this.isOfficeFile = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
    
    this.canPreviewFile = this.isImageFile || this.isPdfFile || this.isOfficeFile;
    
    console.log('=== Preview flags updated:', {
      canPreviewFile: this.canPreviewFile,
      isImageFile: this.isImageFile,
      isPdfFile: this.isPdfFile,
      isOfficeFile: this.isOfficeFile
    });
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
    if (!this.document) {
      console.error('Cannot rate: document is null');
      return;
    }
    
    console.log('🌟 rateDocument called with rating:', rating, 'documentId:', this.document.id);
    
    // Store old rating for rollback if needed
    const oldRating = this.userRating;
    const oldStats = this.ratingStats ? { ...this.ratingStats } : null;
    
    // Optimistic update - update UI immediately
    this.userRating = rating;
    
    // Update stats optimistically
    if (this.ratingStats) {
      // If user already rated, we're updating
      if (oldRating > 0) {
        // Remove old rating from distribution
        this.decrementRatingStar(this.ratingStats, oldRating);
        // Add new rating to distribution
        this.incrementRatingStar(this.ratingStats, rating);
      } else {
        // New rating - increment total and add to distribution
        this.ratingStats.totalRatings++;
        this.incrementRatingStar(this.ratingStats, rating);
      }
      
      // Recalculate average
      this.recalculateAverage(this.ratingStats);
    }
    
    // Force change detection
    this.cdr.detectChanges();
    
    console.log('🌟 Calling ratingService.rateDocument API...');
    
    // Send to backend
    this.ratingService.rateDocument(this.document.id, rating).subscribe({
      next: (ratingResponse) => {
        console.log('✅ Rating API success:', ratingResponse);
        // Show success message
        this.snackBar.open(`Rated ${rating} stars`, 'Close', { duration: 2000 });
        // Reload stats from server to ensure accuracy
        this.loadRatingStats(this.document!.id);
      },
      error: (error) => {
        console.error('❌ Error rating document:', error);
        // Rollback optimistic update on error
        this.userRating = oldRating;
        if (oldStats) {
          this.ratingStats = oldStats;
        }
        this.cdr.detectChanges();
        this.snackBar.open('Failed to rate document', 'Close', { duration: 3000 });
      }
    });
  }
  
  private incrementRatingStar(stats: RatingStats, rating: number): void {
    switch(rating) {
      case 5: stats.fiveStars++; break;
      case 4: stats.fourStars++; break;
      case 3: stats.threeStars++; break;
      case 2: stats.twoStars++; break;
      case 1: stats.oneStar++; break;
    }
  }
  
  private decrementRatingStar(stats: RatingStats, rating: number): void {
    switch(rating) {
      case 5: stats.fiveStars = Math.max(0, stats.fiveStars - 1); break;
      case 4: stats.fourStars = Math.max(0, stats.fourStars - 1); break;
      case 3: stats.threeStars = Math.max(0, stats.threeStars - 1); break;
      case 2: stats.twoStars = Math.max(0, stats.twoStars - 1); break;
      case 1: stats.oneStar = Math.max(0, stats.oneStar - 1); break;
    }
  }
  
  private recalculateAverage(stats: RatingStats): void {
    if (stats.totalRatings === 0) {
      stats.averageRating = 0;
      return;
    }
    
    const totalScore = (stats.fiveStars * 5) + (stats.fourStars * 4) + 
                       (stats.threeStars * 3) + (stats.twoStars * 2) + 
                       (stats.oneStar * 1);
    stats.averageRating = totalScore / stats.totalRatings;
  }

  deleteRating(): void {
    if (!this.document) return;
    
    // Store old values for rollback if needed
    const oldRating = this.userRating;
    const oldStats = this.ratingStats ? { ...this.ratingStats } : null;
    
    // Optimistic update - update UI immediately
    if (this.ratingStats && oldRating > 0) {
      // Remove rating from distribution
      this.decrementRatingStar(this.ratingStats, oldRating);
      this.ratingStats.totalRatings = Math.max(0, this.ratingStats.totalRatings - 1);
      // Recalculate average
      this.recalculateAverage(this.ratingStats);
    }
    this.userRating = 0;
    
    // Force change detection
    this.cdr.detectChanges();
    
    this.ratingService.deleteRating(this.document.id).subscribe({
      next: () => {
        this.snackBar.open('Rating removed', 'Close', { duration: 2000 });
        // Reload stats from server to ensure accuracy
        this.loadRatingStats(this.document!.id);
      },
      error: (error) => {
        console.error('Error deleting rating:', error);
        // Rollback optimistic update on error
        this.userRating = oldRating;
        if (oldStats) {
          this.ratingStats = oldStats;
        }
        this.cdr.detectChanges();
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
    if (!this.document || !this.document.filePath) return;
    
    // Build download URL
    const normalizedPath = this.document.filePath.startsWith('/') 
      ? this.document.filePath 
      : `/${this.document.filePath}`;
    const downloadUrl = `http://localhost:8090${normalizedPath}`;
    
    console.log('=== Downloading file from:', downloadUrl);
    
    // Create temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = this.document.fileName || this.document.title || 'download';
    link.target = '_blank';
    
    // Trigger click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.snackBar.open('Download started...', 'Close', { duration: 2000 });
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Navigate to another document
   */
  navigateToDocument(documentId: number): void {
    this.router.navigate(['/documents', documentId]);
  }

  onImageError(event: Event): void {
    console.error('=== Image failed to load:', event);
    const img = event.target as HTMLImageElement;
    console.error('=== Image src was:', img.src);
  }

  onImageLoad(): void {
    console.log('=== Image loaded successfully!');
  }
}
