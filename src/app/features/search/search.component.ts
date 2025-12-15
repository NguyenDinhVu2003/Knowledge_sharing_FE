import { Component, OnInit, inject } from '@angular/core';
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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService, SearchRequest, SearchResponse } from '../../core/services/search.service';
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
    HeaderComponent,
    FooterComponent,
    DocumentCardComponent
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private searchService = inject(SearchService);
  private router = inject(Router);

  searchForm!: FormGroup;
  searchResults: SearchResponse = {
    documents: [],
    totalCount: 0,
    page: 0,
    totalPages: 0
  };

  availableTags: string[] = [];
  availableGroups: any[] = [];

  searching: boolean = false;
  searchPerformed: boolean = false;
  lastSearchQuery: string = '';
  pageSize: number = 10;

  get isSemanticSearch(): boolean {
    return this.searchForm.get('searchType')?.value === 'SEMANTIC';
  }

  ngOnInit() {
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
    // Load available tags
    this.searchService.getAllTags().subscribe({
      next: (tags) => this.availableTags = tags,
      error: (err) => console.error('Failed to load tags', err)
    });

    // Load available groups
    this.searchService.getAllGroups().subscribe({
      next: (groups) => this.availableGroups = groups,
      error: (err) => console.error('Failed to load groups', err)
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

    if (!query || query.length < 2) {
      return; // Require at least 2 characters
    }

    this.searching = true;
    this.lastSearchQuery = query;
    this.searchPerformed = true;

    if (this.isSemanticSearch) {
      // Perform semantic search
      this.searchService.semanticSearch(query, 0, this.pageSize).subscribe({
        next: (response) => {
          this.searchResults = response;
          this.searching = false;
        },
        error: (err) => {
          console.error('Semantic search failed', err);
          this.searching = false;
        }
      });
    } else {
      // Perform keyword search with filters
      const searchRequest: SearchRequest = {
        filters: {
          query: query,
          tags: this.searchForm.get('tags')?.value,
          dateFrom: this.searchForm.get('dateFrom')?.value,
          dateTo: this.searchForm.get('dateTo')?.value,
          sharingLevel: this.searchForm.get('sharingLevel')?.value || undefined,
          groupId: this.searchForm.get('groupId')?.value || undefined,
          sortBy: this.searchForm.get('sortBy')?.value
        },
        searchType: 'KEYWORD',
        page: 0,
        pageSize: this.pageSize
      };

      this.searchService.searchDocuments(searchRequest).subscribe({
        next: (response) => {
          this.searchResults = response;
          this.searching = false;
        },
        error: (err) => {
          console.error('Search failed', err);
          this.searching = false;
        }
      });
    }
  }

  onPageChange(event: PageEvent) {
    const query = this.searchForm.get('query')?.value;
    this.pageSize = event.pageSize;

    if (this.isSemanticSearch) {
      this.searchService.semanticSearch(query, event.pageIndex, event.pageSize).subscribe({
        next: (response) => this.searchResults = response
      });
    } else {
      const searchRequest: SearchRequest = {
        filters: {
          query: query,
          tags: this.searchForm.get('tags')?.value,
          dateFrom: this.searchForm.get('dateFrom')?.value,
          dateTo: this.searchForm.get('dateTo')?.value,
          sharingLevel: this.searchForm.get('sharingLevel')?.value || undefined,
          groupId: this.searchForm.get('groupId')?.value || undefined,
          sortBy: this.searchForm.get('sortBy')?.value
        },
        searchType: 'KEYWORD',
        page: event.pageIndex,
        pageSize: event.pageSize
      };

      this.searchService.searchDocuments(searchRequest).subscribe({
        next: (response) => this.searchResults = response
      });
    }
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
      totalCount: 0,
      page: 0,
      totalPages: 0
    };
  }

  searchExample(exampleQuery: string) {
    this.searchForm.patchValue({ query: exampleQuery });
    this.performSearch();
  }

  navigateToDocument(documentId: number) {
    this.router.navigate(['/documents', documentId]);
  }

  trackByDocId(index: number, doc: Document): number {
    return doc.id;
  }
}
