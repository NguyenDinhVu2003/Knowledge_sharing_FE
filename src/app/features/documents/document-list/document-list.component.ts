import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  unreadCount$: Observable<number> = new Observable();
  loading: boolean = true;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (documents) => {
        this.allDocuments = documents;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading documents:', err);
        this.loading = false;
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
        doc.sharing_level.toUpperCase() === this.filterLevel
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
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'oldest':
        this.filteredDocuments.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'popular':
        this.filteredDocuments.sort((a, b) => 
          (b.average_rating || 0) - (a.average_rating || 0)
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

  onLogout(): void {
    this.authService.logout();
  }
}
