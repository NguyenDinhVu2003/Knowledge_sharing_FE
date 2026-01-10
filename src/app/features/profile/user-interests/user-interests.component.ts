import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services and Models
import { UserInterestService } from '../../../core/services/user-interest.service';
import { UserInterest, Tag } from '../../../core/models/user-interest.model';

// Shared Components
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-user-interests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './user-interests.component.html',
  styleUrls: ['./user-interests.component.scss']
})
export class UserInterestsComponent implements OnInit {
  private userInterestService = inject(UserInterestService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  allTags$!: Observable<Tag[]>;
  popularTags$!: Observable<Tag[]>;
  selectedTagIds: number[] = [];
  originalSelectedIds: number[] = [];
  searchControl = new FormControl('');
  filteredTags$!: Observable<Tag[]>;
  loading: boolean = true;
  saving: boolean = false;
  allTagsCache: Tag[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    console.log('🔄 loadData started, setting loading = true');
    this.loading = true;

    forkJoin({
      allTags: this.userInterestService.getAllTags(),
      popularTags: this.userInterestService.getPopularTags(10)
    }).subscribe({
      next: (data) => {
        console.log('✅ Data loaded successfully:', data);
        
        this.allTagsCache = data.allTags;
        this.allTags$ = of(data.allTags);
        this.popularTags$ = of(data.popularTags);

        // Initialize selected tags from allTags where isInterested = true
        this.selectedTagIds = data.allTags
          .filter(tag => tag.isInterested)
          .map(tag => tag.id);
        this.originalSelectedIds = [...this.selectedTagIds];

        console.log('✅ Selected tag IDs:', this.selectedTagIds);
        console.log('✅ Setting loading = false');
        
        this.loading = false;
        
        // Setup search filter
        this.setupSearchFilter();
// Force change detection
        this.cdr.detectChanges();
        
        console.log('✅ After setting loading:', this.loading);
      },
      error: (err) => {
        console.error('❌ Error loading data:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
      }
    });
  }

  setupSearchFilter() {
    this.filteredTags$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(searchTerm => {
        if (!searchTerm || searchTerm.trim() === '') {
          // Return cached tags when no search term
          return this.allTagsCache;
        }
        // For search, we'll filter client-side from cache
        // Or call API with search param (better for large datasets)
        const search = searchTerm.toLowerCase();
        return this.allTagsCache.filter(tag => 
          tag.name.toLowerCase().includes(search) ||
          tag.description?.toLowerCase().includes(search)
        );
      })
    );
  }

  isSelected(tagId: number): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  toggleTag(tagId: number) {
    if (this.isSelected(tagId)) {
      this.removeInterest(tagId);
    } else {
      this.addInterest(tagId);
    }
  }

  addInterest(tagId: number) {
    if (!this.isSelected(tagId)) {
      this.selectedTagIds.push(tagId);
      this.selectedTagIds = [...this.selectedTagIds]; // Trigger change detection
    }
  }

  removeInterest(tagId: number) {
    const index = this.selectedTagIds.indexOf(tagId);
    if (index > -1) {
      this.selectedTagIds.splice(index, 1);
      this.selectedTagIds = [...this.selectedTagIds]; // Trigger change detection
    }
  }

  get hasChanges(): boolean {
    if (this.selectedTagIds.length !== this.originalSelectedIds.length) {
      return true;
    }
    return !this.selectedTagIds.every(id => this.originalSelectedIds.includes(id));
  }

  saveInterests() {
    if (this.selectedTagIds.length === 0) {
      this.snackBar.open('Please select at least one interest', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    this.userInterestService.updateUserInterests(this.selectedTagIds).subscribe({
      next: (updatedTags) => {
        this.saving = false;
        this.originalSelectedIds = [...this.selectedTagIds];
        
        // Update isInterested flag in cache
        this.allTagsCache = this.allTagsCache.map(tag => ({
          ...tag,
          isInterested: this.selectedTagIds.includes(tag.id)
        }));
        
        this.snackBar.open('Interests saved successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.saving = false;
        console.error('Error saving interests:', err);
        const errorMsg = err.error?.message || 'Failed to save interests';
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
      }
    });
  }

  resetInterests() {
    this.selectedTagIds = [...this.originalSelectedIds];
  }

  getTagById(tagId: number): Tag | undefined {
    return this.allTagsCache.find(t => t.id === tagId);
  }
}
