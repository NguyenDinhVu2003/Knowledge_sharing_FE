import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService, SearchRequest, SearchResponse, Tag, Group } from '../../core/services/search.service';
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { Document } from '../../core/models/document.model';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { DocumentCardComponent } from '../../shared/components/document-card/document-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
    MatListModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private searchService = inject(SearchService);
  private authService = inject(AuthService);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  searchForm!: FormGroup;
  currentUserId: number | null = null;
  searchResults: SearchResponse = {
    documents: [],
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    tagFacets: null,
    fileTypeFacets: null,
    sharingLevelFacets: null,
    ownerFacets: null,
    query: null,
    searchTimeMs: 0
  };

  availableTags: Tag[] = [];
  availableGroups: Group[] = [];

  searching: boolean = false;
  searchPerformed: boolean = false;
  lastSearchQuery: string = '';
  pageSize: number = 10;

  get isSemanticSearch(): boolean {
    return this.searchForm.get('searchType')?.value === 'SEMANTIC';
  }

  ngOnInit() {
    // Get current user ID
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id ?? null;
    
    this.initForm();
    this.loadFilterOptions();

    // Optional: Auto-search on query input (debounced)
    // Uncomment if you want automatic search while typing
    // this.searchForm.get('query')?.valueChanges
    //   .pipe(
    //     debounceTime(500),
    //     distinctUntilChanged()
    //   )
    //   .subscribe(() => {
    //     const query = this.searchForm.get('query')?.value;
    //     if (query && query.length >= 3) {
    //       this.performSearch();
    //     }
    //   });
  }

  initForm() {
    this.searchForm = this.fb.group({
      searchType: ['KEYWORD'],
      query: [''],
      tags: [[]],
      dateFrom: [null],
      dateTo: [null],
      sharingLevel: [''],
      groupId: [''],
      sortBy: ['recent']
    });
  }

  loadFilterOptions() {
    console.log('⏰ Loading filter options...');
    const startTime = performance.now();
    
    // Load available tags
    this.searchService.getAllTags().subscribe({
      next: (tags) => {
        this.availableTags = tags;
        console.log(`✅ Tags loaded in ${(performance.now() - startTime).toFixed(2)}ms:`, tags.length, 'tags');
        this.cdr.markForCheck();
      },
      error: (err) => console.error('❌ Failed to load tags', err)
    });

    // Load available groups
    this.searchService.getAllGroups().subscribe({
      next: (groups) => {
        this.availableGroups = groups;
        console.log(`✅ Groups loaded in ${(performance.now() - startTime).toFixed(2)}ms:`, groups.length, 'groups');
        this.cdr.markForCheck();
      },
      error: (err) => console.error('❌ Failed to load groups', err)
    });
  }

  onSearchTypeChange() {
    // Reset filters when switching search type
    if (this.isSemanticSearch) {
      // Clear advanced filters for semantic search
      this.searchForm.patchValue({
        tags: [],
        dateFrom: null,
        dateTo: null,
        sharingLevel: '',
        groupId: '',
        sortBy: 'recent'
      });
    }
  }

  performSearch() {
    const query = this.searchForm.get('query')?.value?.trim();

    console.log('🔍 performSearch called, query:', query);
    console.log('📋 Form values:', this.searchForm.value);

    // Allow search with filters even without query
    // if (!query || query.length < 2) {
    //   return;
    // }

    this.searching = true;
    this.lastSearchQuery = query || '';
    this.searchPerformed = true;

    // Perform unified search with all filters
    const searchRequest: SearchRequest = {
      filters: {
        q: query || undefined,
        tags: this.searchForm.get('tags')?.value,
        fromDate: this.searchForm.get('dateFrom')?.value,
        toDate: this.searchForm.get('dateTo')?.value,
        sharingLevel: this.searchForm.get('sharingLevel')?.value || undefined,
        sortBy: this.searchForm.get('sortBy')?.value
      },
      searchType: 'KEYWORD',
      page: 0,
      pageSize: this.pageSize
    };

    console.log('📤 Search request:', searchRequest);

    this.searchService.searchDocuments(searchRequest).subscribe({
      next: (response) => {
        console.log('✅ Search response received:', response);
        this.searchResults = response;
        this.searching = false;
        console.log('✅ UI updated, searching:', this.searching);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('❌ Search failed:', err);
        this.searching = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(event: PageEvent) {
    const query = this.searchForm.get('query')?.value;
    this.pageSize = event.pageSize;

    const searchRequest: SearchRequest = {
      filters: {
        q: query,
        tags: this.searchForm.get('tags')?.value,
        fromDate: this.searchForm.get('dateFrom')?.value,
        toDate: this.searchForm.get('dateTo')?.value,
        sharingLevel: this.searchForm.get('sharingLevel')?.value || undefined,
        sortBy: this.searchForm.get('sortBy')?.value
      },
      searchType: 'KEYWORD',
      page: event.pageIndex,
      pageSize: event.pageSize
    };

    this.searchService.searchDocuments(searchRequest).subscribe({
      next: (response) => {
        this.searchResults = response;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Pagination search failed', err);
        this.searching = false;
        this.cdr.markForCheck();
      }
    });
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchForm.get('tags')?.value?.length > 0) count++;
    if (this.searchForm.get('dateFrom')?.value) count++;
    if (this.searchForm.get('dateTo')?.value) count++;
    if (this.searchForm.get('sharingLevel')?.value) count++;
    if (this.searchForm.get('groupId')?.value) count++;
    return count;
  }

  clearFilters() {
    this.searchForm.patchValue({
      query: '',
      tags: [],
      dateFrom: null,
      dateTo: null,
      sharingLevel: '',
      groupId: '',
      sortBy: 'recent'
    });
    this.searchPerformed = false;
    this.searchResults = {
      documents: [],
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10,
      tagFacets: null,
      fileTypeFacets: null,
      sharingLevelFacets: null,
      ownerFacets: null,
      query: null,
      searchTimeMs: 0
    };
  }

  searchExample(exampleQuery: string) {
    this.searchForm.patchValue({ query: exampleQuery });
    this.performSearch();
  }

  navigateToDocument(documentId: number) {
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
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?\n\nThis action cannot be undone.'
    );

    if (confirmed) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: () => {
          this.snackBar.open('Document deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          // Re-run the search to refresh results
          this.performSearch();
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
  }

  trackByDocId(index: number, doc: Document): number {
    return doc.id;
  }
}
