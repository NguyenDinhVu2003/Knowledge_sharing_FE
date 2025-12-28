import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services and Models
import { FavoriteService } from '../../core/services/favorite.service';
import { Favorite } from '../../core/models/favorite.model';

// Shared Components
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  favorites$!: Observable<Favorite[]>;
  sortedFavorites$!: Observable<Favorite[]>;
  loading: boolean = true;
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: 'recent' | 'oldest' | 'title' | 'rating' = 'recent';

  ngOnInit(): void {
    this.loadFavorites();
    this.loadViewModePreference();
  }

  /**
   * Load view mode preference from localStorage
   */
  private loadViewModePreference(): void {
    const savedViewMode = localStorage.getItem('favoritesViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode = savedViewMode;
    }
  }

  /**
   * Load all favorites
   */
  loadFavorites(): void {
    this.loading = true;
    this.favorites$ = this.favoriteService.getFavorites();
    this.sortedFavorites$ = this.favorites$;
    
    this.favorites$.subscribe({
      next: (favorites) => {
        console.log('Favorites loaded:', favorites);
        console.log('Favorites count:', favorites.length);
        if (favorites.length > 0) {
          console.log('First favorite:', favorites[0]);
        }
        this.loading = false;
        this.applySorting();
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.loading = false;
        this.snackBar.open('Failed to load favorites', 'Close', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Handle view mode change
   */
  onViewModeChange(): void {
    localStorage.setItem('favoritesViewMode', this.viewMode);
  }

  /**
   * Handle sort change
   */
  onSortChange(): void {
    this.applySorting();
  }

  /**
   * Apply sorting to favorites list
   */
  applySorting(): void {
    this.sortedFavorites$ = this.favorites$.pipe(
      map(favorites => {
        const sorted = [...favorites];
        
        switch (this.sortBy) {
          case 'recent':
            sorted.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            break;
          case 'oldest':
            sorted.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            break;
          case 'title':
            sorted.sort((a, b) => 
              a.documentTitle.localeCompare(b.documentTitle)
            );
            break;
          case 'rating':
            sorted.sort((a, b) => 
              (b.averageRating || 0) - (a.averageRating || 0)
            );
            break;
        }
        
        return sorted;
      })
    );
  }

  /**
   * Navigate to document detail page
   */
  navigateToDocument(documentId: number): void {
    this.router.navigate(['/documents', documentId]);
  }

  /**
   * Confirm and remove favorite
   */
  confirmRemove(favorite: Favorite): void {
    const confirmed = window.confirm(`Remove "${favorite.documentTitle}" from favorites?`);
    if (confirmed) {
      this.removeFavorite(favorite);
    }
  }

  /**
   * Remove favorite with undo option
   */
  removeFavorite(favorite: Favorite): void {
    this.favoriteService.removeFavorite(favorite.documentId).subscribe({
      next: () => {
        const snackBarRef = this.snackBar.open('Removed from favorites', 'Undo', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        snackBarRef.onAction().subscribe(() => {
          // Undo action - add back to favorites
          this.favoriteService.addFavorite(favorite.documentId).subscribe({
            next: () => {
              this.snackBar.open('Favorite restored', 'Close', { 
                duration: 2000,
                horizontalPosition: 'end',
                verticalPosition: 'top'
              });
              this.loadFavorites();
            }
          });
        });
        
        this.loadFavorites();
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
        this.snackBar.open('Failed to remove favorite', 'Close', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Confirm and remove all favorites
   */
  confirmRemoveAll(): void {
    const confirmed = window.confirm('Are you sure you want to remove ALL favorites? This action cannot be undone.');
    if (confirmed) {
      this.removeAllFavorites();
    }
  }

  /**
   * Remove all favorites
   */
  removeAllFavorites(): void {
    this.favorites$.subscribe(favorites => {
      if (favorites.length === 0) return;

      const removePromises = favorites.map(f => 
        this.favoriteService.removeFavorite(f.documentId).toPromise()
      );

      Promise.all(removePromises).then(() => {
        this.snackBar.open('All favorites cleared', 'Close', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        this.loadFavorites();
      }).catch(err => {
        console.error('Error clearing favorites:', err);
        this.snackBar.open('Failed to clear favorites', 'Close', { 
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      });
    });
  }
}
