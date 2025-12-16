import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
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

  allTags$!: Observable<Tag[]>;
  popularTags$!: Observable<Tag[]>;
  userInterests$!: Observable<UserInterest[]>;
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
    this.loading = true;

    forkJoin({
      allTags: this.userInterestService.getAllTags(),
      popularTags: this.userInterestService.getPopularTags(),
      userInterests: this.userInterestService.getUserInterests()
    }).subscribe({
      next: (data) => {
        this.allTagsCache = data.allTags;
        this.allTags$ = of(data.allTags);
        this.popularTags$ = of(data.popularTags);
        this.userInterests$ = of(data.userInterests);

        // Initialize selected tags
        this.selectedTagIds = data.userInterests.map(i => i.tagId);
        this.originalSelectedIds = [...this.selectedTagIds];

        // Setup search filter
        this.setupSearchFilter();

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
      }
    });
  }

  setupSearchFilter() {
    this.filteredTags$ = combineLatest([
      this.allTags$,
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([tags, searchTerm]) => {
        if (!searchTerm || searchTerm.trim() === '') {
          return tags;
        }
        const search = searchTerm.toLowerCase();
        return tags.filter(tag => 
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
      next: () => {
        this.saving = false;
        this.originalSelectedIds = [...this.selectedTagIds];
        this.snackBar.open('Interests saved successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open('Failed to save interests', 'Close', { duration: 3000 });
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
