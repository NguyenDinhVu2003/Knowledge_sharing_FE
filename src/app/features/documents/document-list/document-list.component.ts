import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services and Models
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { Document } from '../../../core/models';

// Shared Components
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../../shared/components/document-card/document-card.component';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatIconModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  showOnlyMyDocuments: boolean = false;

  allDocuments: Document[] = [];
  filteredDocuments: Document[] = [];
  displayedDocuments: Document[] = [];
  
  searchTerm: string = '';
  filterLevel: string = 'ALL';
  sortBy: string = 'recent';
  
  // Pagination
  pageSize: number = 10;
  pageIndex: number = 0;
  totalDocuments: number = 0;
  
  currentUser$ = this.authService.getCurrentUser$();
  currentUser = this.authService.getCurrentUser();
  unreadCount$: Observable<number> = new Observable();
  loading: boolean = true;

  ngOnInit(): void {
    // Kiểm tra xem có phải đang xem My Documents không
    this.route.data.subscribe(data => {
      this.showOnlyMyDocuments = data['myDocuments'] === true;
      this.loadDocuments();
    });
  }

  loadDocuments(): void {
    console.log('=== loadDocuments STARTED, loading:', this.loading);
    this.loading = true;
    console.log('=== After set loading=true:', this.loading);
    
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        console.log('=== Documents received, count:', documents.length);
        this.allDocuments = documents;
        this.applyFilters();
        console.log('=== BEFORE set loading=false:', this.loading);
        this.loading = false;
        console.log('=== AFTER set loading=false:', this.loading);
        this.cdr.detectChanges();
        console.log('=== After detectChanges, loading:', this.loading);
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onFilter(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onSort(): void {
    this.applySort();
    this.updateDisplayedDocuments();
  }

  applyFilters(): void {
    let filtered = [...this.allDocuments];

    // Lọc theo user hiện tại nếu đang ở My Documents
    if (this.showOnlyMyDocuments) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        filtered = filtered.filter(doc => doc.ownerId === currentUser.id);
      }
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) ||
        doc.summary.toLowerCase().includes(searchLower)
      );
    }

    // Apply sharing level filter
    if (this.filterLevel !== 'ALL') {
      filtered = filtered.filter(doc => 
        doc.sharingLevel.toUpperCase() === this.filterLevel
      );
    }

    this.filteredDocuments = filtered;
    this.totalDocuments = filtered.length;
    this.applySort();
    this.updateDisplayedDocuments();
  }

  applySort(): void {
    switch (this.sortBy) {
      case 'recent':
        this.filteredDocuments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        this.filteredDocuments.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'popular':
        this.filteredDocuments.sort((a, b) => 
          (b.averageRating || 0) - (a.averageRating || 0)
        );
        break;
      case 'title':
        this.filteredDocuments.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
        break;
    }
  }

  updateDisplayedDocuments(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedDocuments = this.filteredDocuments.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedDocuments();
  }

  navigateToDetail(documentId: number): void {
    this.router.navigate(['/documents', documentId]);
  }

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
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?\n\nThis action cannot be undone.'
    );

    if (confirmed) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: () => {
          console.log('Document deleted successfully');
          // Reload documents
          this.loadDocuments();
        },
        error: (err) => {
          console.error('Error deleting document:', err);
          alert('Failed to delete document. Please try again.');
        }
      });
    }
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }
}
